/**
 * Roster Projection engine.
 *
 * Pure TypeScript — no DB. Takes a {@link RosterStats} (per-player
 * historical stats + league averages) and produces a
 * {@link TeamProjection} (expected RS, RA, win expectancy).
 *
 * The pipeline mirrors the spec in ROSTER_PROJECTIONS.md:
 *
 *   Part 1 (offense):
 *     1a-b. Per-batter weighted historical rate stats with regression
 *           to the league mean.
 *     1c.   Linear-weights run-production formula
 *           (runRate = wAVG·AVG + wSLG·SLG_approx + constant).
 *     1d-e. Aggregate to team RS using projected playing time.
 *
 *   Part 2 (defense):
 *     2a-b. Per-pitcher weighted historical RA/9 with regression.
 *     2c.   K-rate adjustment.
 *     2d-e. Aggregate to team RA9 using projected IP share.
 *
 *   Blending (Part 3) lives in `oddsEngine.ts` — the projector emits raw
 *   RS/RA and the engine decides how to blend with observed data.
 *
 * Each step is exported for testing and partial-use cases (e.g. a future
 * "team outlook" widget that wants just the offensive rating).
 */

import {
	PlayerProjection,
	PlayerSeasonStats,
	PlayerBattingProjection,
	PlayerPitchingProjection,
	ProjectionConfig,
	Reliability,
	RosterStats,
	TeamProjection,
	LeagueAverages,
	DataVersion,
} from "@/dtos/projectionDtos";
import {
	DEFAULT_PROJECTION_CONFIG,
	DEFAULT_HAND_TUNED_CONFIG,
} from "@/dtos/projectionDtos";
import { pythagenpatExponent, pythagoreanWinExpectancy } from "@/lib/oddsEngine";

/* -------------------------------------------------------------------------- */
/* Step 1 — Offense                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pick a single rate stat across a player's seasons. `selector` extracts
 * (rate, ab) for each season; missing seasons (ab = 0) are dropped.
 *
 * Returns `{ weightedRate, totalAb }`. If no seasons have data, returns
 * zeros — callers should treat zero-AB players as non-contributors.
 */
function pickWeightedRate(
	seasons: PlayerSeasonStats[],
	selector: (s: PlayerSeasonStats) => { rate: number; ab: number },
	weightsOldestToNewest: number[],
): { weightedRate: number; totalAb: number } {
	// Sort ascending by seasonId so weightsOldestToNewest[i] aligns with the
	// i-th oldest season.
	const ordered = [...seasons].sort((a, b) => a.seasonId - b.seasonId);

	let num = 0;
	let denom = 0;
	let totalAb = 0;
	for (let i = 0; i < ordered.length; i++) {
		const { rate, ab } = selector(ordered[i]);
		if (ab <= 0) continue;
		const weight =
			weightsOldestToNewest[i] ??
			weightsOldestToNewest[weightsOldestToNewest.length - 1];
		num += rate * weight * ab;
		denom += weight * ab;
		totalAb += ab;
	}
	if (denom <= 0) return { weightedRate: 0, totalAb: 0 };
	return { weightedRate: num / denom, totalAb };
}

/**
 * Generic regression-to-the-mean helper.
 *   w = n / (n + k)
 *   regressed = w * observed + (1 - w) * league
 */
export function regressToMean(
	observed: number,
	sampleSize: number,
	league: number,
	k: number,
): number {
	if (k <= 0) return observed;
	const w = sampleSize / (sampleSize + k);
	return w * observed + (1 - w) * league;
}

/**
 * Pick a rate stat for a single season. `numerator` is the count of events
 * (e.g. hits); `denominator` is the count of opportunities (e.g. at-bats).
 * Returns 0 when denominator is 0 (instead of NaN) so downstream math
 * stays clean.
 */
function seasonRate(numerator: number, denominator: number): number {
	return denominator > 0 ? numerator / denominator : 0;
}

/**
 * Step 1a-c — per-batter projection. Computes weighted, regressed rates
 * for AVG / K% / HR/AB / RBI/AB, then derives a per-AB run-production
 * rate via the linear-weights formula.
 *
 * The "rate stats" used here are AVG, K%, HR/AB, RBI/AB. SLG is
 * approximated as `AVG + HR/AB × slgPerHRBonus` because we don't have a
 * 2B/3B breakdown (see the spec's caveats).
 *
 * `leagueAverages` is a single value (not per-season) — pass the
 * most-recent-season league averages that match the player's data
 * version.
 */
export function projectBattingRates(
	seasons: PlayerSeasonStats[],
	league: LeagueAverages,
	config: ProjectionConfig,
): {
	projection: PlayerBattingProjection;
	totalAb: number;
} {
	const weights = config.handTuned.seasonWeights;

	const avgPick = pickWeightedRate(
		seasons,
		(s) => ({ rate: seasonRate(s.hits, s.atBats), ab: s.atBats }),
		weights,
	);
	const kPick = pickWeightedRate(
		seasons,
		(s) => ({ rate: seasonRate(s.strikeouts, s.atBats), ab: s.atBats }),
		weights,
	);
	const hrPick = pickWeightedRate(
		seasons,
		(s) => ({ rate: seasonRate(s.homeRuns, s.atBats), ab: s.atBats }),
		weights,
	);
	const rbiPick = pickWeightedRate(
		seasons,
		(s) => ({ rate: seasonRate(s.rbis, s.atBats), ab: s.atBats }),
		weights,
	);

	const kAB = config.handTuned.kAB;
	const projectedAvg = regressToMean(avgPick.weightedRate, avgPick.totalAb, league.leagueAvg, kAB);
	const projectedKRate = regressToMean(kPick.weightedRate, kPick.totalAb, league.leagueKRate, kAB);
	const projectedHrPerAb = regressToMean(hrPick.weightedRate, hrPick.totalAb, league.leagueHrPerAb, kAB);
	const projectedRbiPerAb = regressToMean(rbiPick.weightedRate, rbiPick.totalAb, league.leagueRbiPerAb, kAB);

	const projectedSlg =
		projectedAvg + projectedHrPerAb * config.handTuned.slgPerHRBonus;

	// Pick the calibration set based on the player's data version.
	const cal = config.calibration[league.dataVersion];
	const runRate =
		cal.wAVG * projectedAvg +
		cal.wSLG * projectedSlg +
		cal.runRateConstant;

	// Step 1d — most-recent-season AB as the projected playing time. Falls
	// back to 0 when the player has no historical seasons (rookies).
	const projectedAb = mostRecentAb(seasons);

	return {
		projection: {
			playerId: seasons[0]?.playerId ?? "",
			projectedAvg,
			projectedKRate,
			projectedHrPerAb,
			projectedRbiPerAb,
			projectedSlg,
			runRate,
			projectedAb,
		},
		totalAb: avgPick.totalAb,
	};
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Defense                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pitcher's IP in a given season (outs / 3).
 */
function seasonIp(s: PlayerSeasonStats): number {
	return s.outsPitched / 3;
}

/**
 * Step 2a-b — per-pitcher RA/9 projection. Weighted historical RA/9
 * (weighted by both recency and IP-sample within each season), then
 * regression to the league mean.
 */
export function projectRA9(
	seasons: PlayerSeasonStats[],
	league: LeagueAverages,
	config: ProjectionConfig,
): {
	projection: PlayerPitchingProjection;
	totalIp: number;
} {
	const weights = config.handTuned.seasonWeights;
	const ordered = [...seasons].sort((a, b) => a.seasonId - b.seasonId);

	let num = 0; // Σ (seasonRA × weight)
	let denom = 0; // Σ (seasonIP × weight)
	let totalIp = 0;
	for (let i = 0; i < ordered.length; i++) {
		const s = ordered[i];
		const ip = seasonIp(s);
		if (ip <= 0) continue;
		const weight =
			weights[i] ?? weights[weights.length - 1];
		num += s.runsAllowed * weight;
		denom += ip * weight;
		totalIp += ip;
	}

	const weightedRa9 = denom > 0 ? (num / denom) * 9 : league.leagueRa9;
	const projectedRa9 = regressToMean(
		weightedRa9,
		totalIp,
		league.leagueRa9,
		config.handTuned.kIP,
	);

	// Step 2c — K-rate as a secondary signal. Compute weighted K/9 across
	// the same seasons, regressed toward the league K/9, then apply the
	// kCoefficient adjustment.
	let kNum = 0;
	let kDenom = 0;
	for (let i = 0; i < ordered.length; i++) {
		const s = ordered[i];
		const ip = seasonIp(s);
		if (ip <= 0) continue;
		const weight = weights[i] ?? weights[weights.length - 1];
		kNum += s.strikeouts * weight;
		kDenom += ip * weight;
	}
	const weightedKPer9 = kDenom > 0 ? (kNum / kDenom) * 9 : league.leagueKPer9;
	const projectedKPer9 = regressToMean(
		weightedKPer9,
		totalIp,
		league.leagueKPer9,
		config.handTuned.kIP,
	);

	const cal = config.calibration[league.dataVersion];
	const kAdjustment =
		(projectedKPer9 - league.leagueKPer9) * cal.kCoefficient;

	const finalRa9 = projectedRa9 + kAdjustment;

	// projectedIP — projected innings for the upcoming season. Use the
	// pitcher's most-recent-season IP as the simplest assumption (mirrors
	// the projectedAB approach for batters).
	const projectedIp = mostRecentIp(seasons);

	return {
		projection: {
			playerId: seasons[0]?.playerId ?? "",
			projectedRa9: finalRa9,
			projectedKPer9,
			projectedIp,
			projectedIpShare: 0, // filled in by aggregateTeamDefense
		},
		totalIp,
	};
}

/* -------------------------------------------------------------------------- */
/* Step 1e / 2e — Team aggregation                                             */
/* -------------------------------------------------------------------------- */

/**
 * Team-level offensive projection from per-player batting projections.
 *
 *   teamRunRate = Σ (playerRunRate × projectedAB) / Σ projectedAB
 *   projectedRS = teamRunRate × leagueAbPerGame
 *
 * Players with projectedAB = 0 contribute nothing (rookies without
 * historical AB don't dilute the team rate).
 */
export function aggregateTeamOffense(
	playerProjections: PlayerBattingProjection[],
	leagueAbPerGame: number,
): number {
	let num = 0;
	let denom = 0;
	for (const p of playerProjections) {
		if (p.projectedAb <= 0) continue;
		num += p.runRate * p.projectedAb;
		denom += p.projectedAb;
	}
	if (denom <= 0) return 0;
	const teamRunRate = num / denom;
	return teamRunRate * leagueAbPerGame;
}

/**
 * Compute each pitcher's IP share of the team total using their
 * most-recent-season IP. Returns a Map keyed by playerId. Step 2f guard
 * is applied here: a pitcher with 0 projected IP gets a 0 share and is
 * skipped during team aggregation.
 */
export function projectIPShare(
	allPlayerSeasons: PlayerSeasonStats[][],
): Map<string, number> {
	// First pass: collect each pitcher's most-recent-season IP.
	const ipByPlayer = new Map<string, number>();
	for (const seasons of allPlayerSeasons) {
		if (seasons.length === 0) continue;
		const mostRecent = mostRecentSeasons(seasons, 1)[0];
		const ip = seasonIp(mostRecent);
		if (ip > 0) ipByPlayer.set(mostRecent.playerId, ip);
	}

	// Second pass: compute share.
	let total = 0;
	for (const ip of ipByPlayer.values()) total += ip;

	const shares = new Map<string, number>();
	if (total <= 0) return shares;
	for (const [playerId, ip] of ipByPlayer) {
		shares.set(playerId, ip / total);
	}
	return shares;
}

/**
 * Step 2e — team-level defensive projection.
 *
 *   teamRA9 = Σ (projectedRA9 × projectedIPShare)
 *
 * Only includes pitchers with projectedIp > 0 (step 2f guard).
 */
export function aggregateTeamDefense(
	pitcherProjections: PlayerPitchingProjection[],
	ipShares: Map<string, number>,
): number {
	let ra9 = 0;
	for (const p of pitcherProjections) {
		if (p.projectedIp <= 0) continue;
		const share = ipShares.get(p.playerId) ?? 0;
		ra9 += p.projectedRa9 * share;
	}
	return ra9;
}

/* -------------------------------------------------------------------------- */
/* Aggregation helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Step 6 — reliability flag based on total sample size.
 */
export function computeReliability(
	totalAb: number,
	config: ProjectionConfig,
): Reliability {
	if (totalAb >= config.handTuned.highSampleThreshold) return "high";
	if (totalAb < config.handTuned.lowSampleThreshold) return "low";
	return "medium";
}

/**
 * Pick the canonical data version for a roster: the dataVersion of the
 * most-recent player-season row on the roster. Falls back to "legacy"
 * (the current default for seasons 1-4) when the roster is empty.
 */
export function canonicalDataVersion(
	players: PlayerSeasonStats[],
): DataVersion {
	if (players.length === 0) return "legacy";
	const mostRecent = [...players].sort(
		(a, b) => b.seasonId - a.seasonId,
	)[0];
	return mostRecent.dataVersion;
}

/**
 * Pull the most recent `n` seasons for a player, ordered newest first.
 */
function mostRecentSeasons(
	seasons: PlayerSeasonStats[],
	n: number,
): PlayerSeasonStats[] {
	return [...seasons]
		.sort((a, b) => b.seasonId - a.seasonId)
		.slice(0, n);
}

function mostRecentAb(seasons: PlayerSeasonStats[]): number {
	const recent = mostRecentSeasons(seasons, 1);
	return recent[0]?.atBats ?? 0;
}

function mostRecentIp(seasons: PlayerSeasonStats[]): number {
	const recent = mostRecentSeasons(seasons, 1);
	return recent[0] ? seasonIp(recent[0]) : 0;
}

/* -------------------------------------------------------------------------- */
/* Main entry point                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Project a full team roster. Returns the {@link TeamProjection} DTO
 * consumed by the odds engine.
 *
 * `config` is optional and defaults to `DEFAULT_PROJECTION_CONFIG`. The
 * pipeline is fully deterministic given the same inputs.
 */
export function projectRoster(
	roster: RosterStats,
	config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG,
): TeamProjection {
	const cutoff = config.handTuned.legacySeasonCutoff;

	// Group per-player historical stats.
	const byPlayer = new Map<string, PlayerSeasonStats[]>();
	for (const row of roster.players) {
		const list = byPlayer.get(row.playerId) ?? [];
		list.push(row);
		byPlayer.set(row.playerId, list);
	}

	// Pick the most-recent-season league averages for each data version.
	const latestLeagueByVersion = new Map<DataVersion, LeagueAverages>();
	for (const la of roster.leagueAverages) {
		const existing = latestLeagueByVersion.get(la.dataVersion);
		if (!existing || la.seasonId > existing.seasonId) {
			latestLeagueByVersion.set(la.dataVersion, la);
		}
	}

	// Default: use the most recent league average overall (across all
	// data versions) when a per-version lookup is missing.
	const fallbackLeague: LeagueAverages =
		[...roster.leagueAverages].sort(
			(a, b) => b.seasonId - a.seasonId,
		)[0] ?? {
			seasonId: 0,
			dataVersion: cutoff >= 4 ? "new" : "legacy",
			leagueAvg: 0.25,
			leagueObp: 0.3,
			leagueRbiPerAb: 0.1,
			leagueKRate: 0.2,
			leagueHrPerAb: 0.02,
			leagueRa9: 4.5,
			leagueKPer9: 6,
			leagueAbPerGame: 28,
		};

	// Compute per-player batting projections.
	const battingProjections: PlayerBattingProjection[] = [];
	let totalSampleAb = 0;
	for (const [, seasons] of byPlayer) {
		const version = canonicalDataVersion(seasons);
		const league = latestLeagueByVersion.get(version) ?? fallbackLeague;
		const { projection, totalAb } = projectBattingRates(
			seasons,
			league,
			config,
		);
		battingProjections.push(projection);
		totalSampleAb += totalAb;
	}

	// Compute per-player pitching projections.
	const pitchingSeasons: PlayerSeasonStats[][] = [];
	const pitchingProjections: PlayerPitchingProjection[] = [];
	for (const [, seasons] of byPlayer) {
		const version = canonicalDataVersion(seasons);
		const league = latestLeagueByVersion.get(version) ?? fallbackLeague;
		const { projection, totalIp } = projectRA9(seasons, league, config);
		// Step 2f guard: only push pitchers who actually pitched in their
		// most recent season.
		if (projection.projectedIp > 0) {
			pitchingProjections.push(projection);
			pitchingSeasons.push(seasons);
			// Use IP-equivalent sample (innings × 3 = out equivalent to
		// an AB roughly) for the reliability tally. Approximate by
		// converting IP to a comparable AB count — not used directly
		// for ratings, just for the sample-size sanity check.
			totalSampleAb += totalIp * 3;
		}
	}

	// IP shares for team defense aggregation.
	const ipShares = projectIPShare(pitchingSeasons);
	for (const p of pitchingProjections) {
		p.projectedIpShare = ipShares.get(p.playerId) ?? 0;
	}

	// Team-level totals.
	const projectedRS = aggregateTeamOffense(
		battingProjections,
		fallbackLeague.leagueAbPerGame,
	);
	const projectedRA = aggregateTeamDefense(pitchingProjections, ipShares);

	// Win expectancy. Uses the same Pythagenpat exponent as the odds
	// engine. League RS is approximated as leagueRa9 (the league is
	// balanced — average runs scored equals average runs allowed).
	const exponent = pythagenpatExponent(fallbackLeague.leagueRa9);
	const projectedWinPct = pythagoreanWinExpectancy(
		projectedRS,
		projectedRA,
		exponent,
	);

	// Sub-component ratings: 0.5 = league average. Pythagorean-style.
	const offensiveRating = clamp01(
		fallbackLeague.leagueRa9 > 0
			? projectedRS / (projectedRS + fallbackLeague.leagueRa9)
			: 0.5,
	);
	const defensiveRating = clamp01(
		projectedRA > 0
			? fallbackLeague.leagueRa9 / (projectedRA + fallbackLeague.leagueRa9)
			: 0.5,
	);

	// Combine batting + pitching projections into a single PlayerProjection
	// map keyed by playerId. Batting projections are always present for
	// every player; pitching fields are added on top when the player
	// recorded pitching outs in their most recent season.
	const combined = new Map<string, PlayerProjection>();
	for (const b of battingProjections) {
		combined.set(b.playerId, { ...b });
	}
	for (const p of pitchingProjections) {
		const existing = combined.get(p.playerId);
		const merged: PlayerProjection = existing
			? { ...existing, ...p }
			: {
					playerId: p.playerId,
					projectedAvg: 0,
					projectedKRate: 0,
					projectedHrPerAb: 0,
					projectedRbiPerAb: 0,
					projectedSlg: 0,
					runRate: 0,
					projectedAb: 0,
					projectedRa9: p.projectedRa9,
					projectedKPer9: p.projectedKPer9,
					projectedIp: p.projectedIp,
					projectedIpShare: p.projectedIpShare,
				};
		combined.set(p.playerId, merged);
	}

	return {
		teamId: roster.teamId,
		projectedRS: round(projectedRS, 4),
		projectedRA: round(projectedRA, 4),
		projectedWinPct: round(projectedWinPct, 4),
		offensiveRating: round(offensiveRating, 4),
		defensiveRating: round(defensiveRating, 4),
		sampleSize: Math.round(totalSampleAb),
		reliability: computeReliability(totalSampleAb, config),
		dataVersion: canonicalDataVersion(roster.players),
		playerProjections: [...combined.values()],
	};
}

/* -------------------------------------------------------------------------- */
/* Utility                                                                      */
/* -------------------------------------------------------------------------- */

function clamp01(x: number): number {
	return Math.min(1, Math.max(0, x));
}

function round(value: number, decimals: number): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

// Re-export for convenience so consumers can import defaults alongside the
// main entry point without an extra import.
export { DEFAULT_PROJECTION_CONFIG, DEFAULT_HAND_TUNED_CONFIG };