/**
 * Roster projection DTOs.
 *
 * Shapes consumed and produced by the roster projector
 * (`src/lib/rosterProjector.ts`) and the calibration script
 * (`src/lib/projectionCalibration.ts`). Pure types — no runtime logic.
 */

/**
 * Marker for which "data generation" a historical row belongs to.
 * - `"legacy"`: seasons 1-4 (Sluggers' original stat-tracking
 *   methodology; `hits` includes fielding errors, etc.)
 * - `"new"`: season 5+ (cleaner MLB-canonical tracking).
 *
 * The projector picks its math branch based on this flag — see the
 * "Data version boundary" section of ROSTER_PROJECTIONS.md.
 */
export type DataVersion = "legacy" | "new";

/**
 * One row of per-season aggregated stats for a single player. Mirrors the
 * shape returned by the `playerGamesStats` aggregate query — the only
 * additions are the derived `dataVersion` flag and the season id so the
 * projector knows which season each row belongs to.
 */
export type PlayerSeasonStats = {
	playerId: string;
	seasonId: number;
	dataVersion: DataVersion;
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	outsPitched: number;
	runsAllowed: number;
	outs: number;
};

/**
 * League-wide per-season averages. One row per season. Computed by
 * `findLeagueAverages` in `rosterProjectionRepository.ts`.
 *
 * `leagueAbPerGame` is per-team per-game (not both teams combined) so it
 * slots directly into the `projectedRS = teamRunRate × leagueAbPerGame`
 * formula — see the spec's "Step 1e".
 */
export type LeagueAverages = {
	seasonId: number;
	dataVersion: DataVersion;
	leagueAvg: number;
	leagueObp: number;
	leagueRbiPerAb: number;
	leagueKRate: number;
	leagueHrPerAb: number;
	leagueRa9: number;
	leagueKPer9: number;
	leagueAbPerGame: number;
};

/**
 * All inputs the projector needs for one team: that team's per-season
 * player aggregates, plus the league averages for each of those seasons.
 */
export type RosterStats = {
	teamId: string;
	players: PlayerSeasonStats[];
	leagueAverages: LeagueAverages[];
};

/**
 * Output of the per-player batting pipeline. Exposed in the
 * `TeamProjection` so UIs that want a "team outlook" breakdown can show
 * how each player contributed.
 */
export type PlayerBattingProjection = {
	playerId: string;
	projectedAvg: number;
	projectedKRate: number;
	projectedHrPerAb: number;
	projectedRbiPerAb: number;
	projectedSlg: number;
	runRate: number;
	projectedAb: number;
};

/**
 * Output of the per-pitcher pipeline.
 */
export type PlayerPitchingProjection = {
	playerId: string;
	projectedRa9: number;
	projectedKPer9: number;
	projectedIp: number;
	projectedIpShare: number;
};

/**
 * Combined per-player projection — every field the projector emits. The
 * batting fields are populated for everyone; the pitching fields are
 * populated only for players who recorded an out in their most recent
 * season (`projectedIp > 0`).
 */
export type PlayerProjection = PlayerBattingProjection &
	Partial<PlayerPitchingProjection>;

/**
 * Categorical flag for how much weight the projection should carry vs.
 * observed data later in the season.
 *
 * - `"high"`: total sample above `highSampleThreshold` — projection can
 *   be trusted heavily.
 * - `"low"`: total sample below `lowSampleThreshold` — projection is
 *   mostly regression to the mean, treat as a rough prior.
 * - `"medium"`: anywhere in between.
 */
export type Reliability = "high" | "medium" | "low";

/**
 * The full projection DTO for one team. Powers both the odds engine
 * (which consumes the RS / RA / win expectancy) and any future
 * "team outlook" UI.
 */
export type TeamProjection = {
	teamId: string;
	/** Expected runs scored per game. */
	projectedRS: number;
	/** Expected runs allowed per game. */
	projectedRA: number;
	/**
	 * Pre-season Pythagorean win expectancy (0-1) computed against the
	 * league run environment using the same Pythagenpat exponent the
	 * odds engine uses.
	 */
	projectedWinPct: number;
	/** Sub-component offensive strength on a 0-1 scale. */
	offensiveRating: number;
	/** Sub-component defensive strength on a 0-1 scale. */
	defensiveRating: number;
	/** Total player-games feeding the projection (sum of season ABs + IPs). */
	sampleSize: number;
	reliability: Reliability;
	/** Which math branch produced this projection. */
	dataVersion: DataVersion;
	/** Per-player breakdown. Useful for UI but not consumed by the odds engine. */
	playerProjections: PlayerProjection[];
};

/**
 * Hand-tuned projection constants (not produced by calibration). See the
 * "Tunable constants" section of the spec.
 */
export type HandTunedConfig = {
	/** Recency weights, oldest to most recent. */
	seasonWeights: number[];
	/** ABs of "prior weight" toward the league mean for rate stats. */
	kAB: number;
	/** Innings of prior weight for pitcher RA/9. */
	kIP: number;
	/**
	 * Extra SLG added per HR/AB to approximate SLG without 2B/3B data.
	 * A HR is worth roughly 1 base beyond a single, plus a base for the
	 * home run ball, plus the run that scores — about 2.0 total bases of
	 * "extra" value over AVG.
	 */
	slgPerHRBonus: number;
	/** Games of equivalent weight given to the projection in the odds blend. */
	priorWeight: number;
	/** Total ABs below this triggers `reliability: "low"`. */
	lowSampleThreshold: number;
	/** Total ABs above this triggers `reliability: "high"`. */
	highSampleThreshold: number;
	/**
	 * Seasons with `id <= legacySeasonCutoff` are flagged
	 * `dataVersion: "legacy"`. Bump this when methodology changes.
	 */
	legacySeasonCutoff: number;
};

/**
 * Calibration-derived projection constants. Initially populated with the
 * hand-typed defaults from the spec; replace with the output of the
 * calibration script after it's been run against historical data.
 */
export type CalibrationConfig = {
	wAVG: number;
	wSLG: number;
	runRateConstant: number;
	kCoefficient: number;
	eraConstant: number;
};

/**
 * Full projection config — hand-tuned defaults + per-data-version
 * calibration constants. The projector picks the calibration set based
 * on the `dataVersion` of the most recent player-season row on the
 * roster.
 */
export type ProjectionConfig = {
	handTuned: HandTunedConfig;
	calibration: Record<DataVersion, CalibrationConfig>;
};

/**
 * Defaults the spec calls out as the hand-tuned starting point. See the
 * "Hand-tuned constants" table in ROSTER_PROJECTIONS.md.
 */
export const DEFAULT_HAND_TUNED_CONFIG: HandTunedConfig = {
	seasonWeights: [0.5, 0.75, 1.0, 1.5],
	kAB: 100,
	kIP: 30,
	slgPerHRBonus: 1.5, // flat modifier to HRs in slugging% calculations
	priorWeight: 40,
	lowSampleThreshold: 100,
	highSampleThreshold: 400,
	legacySeasonCutoff: 4,
};

/**
 * Spec placeholder calibration values, used until the calibration script
 * is run against real historical data. The script overwrites these by
 * hand-editing `DEFAULT_LEGACY_CALIBRATION` / `DEFAULT_NEW_CALIBRATION`.
 */
export const DEFAULT_LEGACY_CALIBRATION: CalibrationConfig = {
	wAVG: 0.28, // how much batting avg. contributes to estimated runs scored, on average
	wSLG: 0.320, // same but with "slugging" (only counts hits+HRs in legacy)
	runRateConstant: -0.18, // pulls every team's projection up or down by a fixed amount
	kCoefficient: -2.0, // how much strikeouts affect estimated runs allowed ()
	eraConstant: 8.6860,
};

/** v2 calibration for post-season-5 data. Same placeholders for now. */
export const DEFAULT_NEW_CALIBRATION: CalibrationConfig = {
	wAVG: 1.0,
	wSLG: 1.5,
	runRateConstant: -0.3,
	kCoefficient: 0.15,
	eraConstant: 0,
};

/** Top-level default config the projector reads by default. */
export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
	handTuned: DEFAULT_HAND_TUNED_CONFIG,
	calibration: {
		legacy: DEFAULT_LEGACY_CALIBRATION,
		new: DEFAULT_NEW_CALIBRATION,
	},
};

/**
 * One row of the regression dataset produced by
 * `extractCalibrationDataset`. One entry per (team, season).
 */
export type CalibrationDataset = {
	teamId: string;
	seasonId: number;
	dataVersion: DataVersion;
	teamRunsScored: number;
	teamRunsAllowed: number;
	teamAvg: number;
	teamSlgApprox: number;
	teamKRate: number;
	teamHrPerAb: number;
	teamRbiPerAb: number;
	teamKPer9: number;
	teamRa9: number;
	leagueAbPerGame: number;
};

/** Fitted coefficients per data version. */
export type CalibrationCoefficients = Record<DataVersion, CalibrationConfig>;
