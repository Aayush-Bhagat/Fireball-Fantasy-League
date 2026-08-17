/**
 * Projection evaluation script.
 *
 * Reads the current calibration constants from
 * `src/dtos/projectionDtos.ts`, projects every team in the given season
 * using all historical data up to and including that season, and prints
 * actual-vs-projected RS / RA / win-pct side by side. Designed for fast
 * iteration: edit the constants, save the file, re-run the script.
 *
 * Usage:
 *   npx tsx scripts/projectionEvaluate.ts <seasonId> [<seasonId> ...]
 *
 * Example:
 *   npx tsx scripts/projectionEvaluate.ts 4
 *   npx tsx scripts/projectionEvaluate.ts 1 2 3 4
 *
 * Output:
 *   - Per-team table (sorted by actual RS desc) with projected vs actual
 *     RS, RA, and Pythagorean win-pct.
 *   - Aggregate error metrics at the bottom: mean bias, MAE, RMSE, and
 *     Pearson correlation for RS / RA / win-pct.
 */

import { sql, eq, and, ne, isNotNull, inArray, avg } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { playerGamesStats, players } from "@/models/players";
import { teams } from "@/models/teams";
import { projectRoster } from "@/lib/rosterProjector";
import {
	DEFAULT_LEGACY_CALIBRATION,
	DEFAULT_NEW_CALIBRATION,
	DEFAULT_HAND_TUNED_CONFIG,
	LeagueAverages,
	PlayerSeasonStats,
	ProjectionConfig,
	RosterStats,
	TeamProjection,
} from "@/dtos/projectionDtos";

/* -------------------------------------------------------------------------- */
/* I/O — args                                                                  */
/* -------------------------------------------------------------------------- */

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error(
		"Usage: npx tsx scripts/projectionEvaluate.ts <seasonId> [<seasonId> ...]\n" +
			"Example: npx tsx scripts/projectionEvaluate.ts 4",
	);
	process.exit(1);
}

const targetSeasons = args
	.map((s) => Number(s))
	.filter((n) => Number.isFinite(n) && n > 0);
if (targetSeasons.length === 0) {
	console.error("No valid season ids provided.");
	process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* DB helpers                                                                  */
/* -------------------------------------------------------------------------- */

const opponent = alias(teamGames, "opponent");

/**
 * Per-team actual RS / RA / games for a given season, taken from the
 * `teamGames` table. Joins the opponent row via the same alias pattern
 * used in `oddsRepository.findTeamRunAverages`.
 */
async function fetchActualTeamStats(seasonId: number): Promise<
	Array<{
		teamId: string;
		teamName: string;
		actualRS: number;
		actualRA: number;
		games: number;
	}>
> {
	const rows = await db
		.select({
			teamId: teamGames.teamId,
			teamName: teams.name,
			actualRS: avg(teamGames.score),
			actualRA: avg(opponent.score),
			games: sql<number>`COUNT(${teamGames.gameId})`,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(teams, eq(teams.id, teamGames.teamId))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				ne(opponent.teamId, teamGames.teamId),
			),
		)
		.where(
			and(
				eq(games.seasonId, seasonId),
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(teamGames.teamId, teams.name);

	return rows.map((r) => ({
		teamId: r.teamId,
		teamName: r.teamName,
		actualRS: Number(r.actualRS ?? 0),
		actualRA: Number(r.actualRA ?? 0),
		games: Number(r.games ?? 0),
	}));
}

/**
 * Per-(team, season) player aggregates for a team, joined through
 * `games` to get the season id. Same shape the projection service
 * consumes.
 */
async function fetchRosterAggregates(
	teamId: string,
	seasonIds: number[],
): Promise<PlayerSeasonStats[]> {
	if (seasonIds.length === 0) return [];

	const rows = await db
		.select({
			playerId: players.id,
			seasonId: games.seasonId,
			atBats: sql<number>`COALESCE(SUM(${playerGamesStats.atBats}), 0)`,
			hits: sql<number>`COALESCE(SUM(${playerGamesStats.hits}), 0)`,
			runs: sql<number>`COALESCE(SUM(${playerGamesStats.runs}), 0)`,
			rbis: sql<number>`COALESCE(SUM(${playerGamesStats.rbis}), 0)`,
			walks: sql<number>`COALESCE(SUM(${playerGamesStats.walks}), 0)`,
			strikeouts: sql<number>`COALESCE(SUM(${playerGamesStats.strikeouts}), 0)`,
			homeRuns: sql<number>`COALESCE(SUM(${playerGamesStats.homeRuns}), 0)`,
			outsPitched: sql<number>`COALESCE(SUM(${playerGamesStats.outsPitched}), 0)`,
			runsAllowed: sql<number>`COALESCE(SUM(${playerGamesStats.runsAllowed}), 0)`,
			outs: sql<number>`COALESCE(SUM(${playerGamesStats.outs}), 0)`,
		})
		.from(players)
		.leftJoin(playerGamesStats, eq(playerGamesStats.playerId, players.id))
		.leftJoin(games, eq(games.id, playerGamesStats.gameId))
		.where(
			and(
				eq(players.teamId, teamId),
				inArray(games.seasonId, seasonIds),
			),
		)
		.groupBy(players.id, games.seasonId)
		.orderBy(players.id, games.seasonId);

	return rows
		.filter((r) => r.seasonId !== null)
		.map((row) => {
			const seasonId = Number(row.seasonId);
			return {
				playerId: row.playerId,
				seasonId,
				dataVersion: (seasonId <= 4 ? "legacy" : "new") as
					| "legacy"
					| "new",
				atBats: Number(row.atBats ?? 0),
				hits: Number(row.hits ?? 0),
				runs: Number(row.runs ?? 0),
				rbis: Number(row.rbis ?? 0),
				walks: Number(row.walks ?? 0),
				strikeouts: Number(row.strikeouts ?? 0),
				homeRuns: Number(row.homeRuns ?? 0),
				outsPitched: Number(row.outsPitched ?? 0),
				runsAllowed: Number(row.runsAllowed ?? 0),
				outs: Number(row.outs ?? 0),
			};
		});
}

/**
 * League-wide per-season averages — the same shape the projection
 * service uses. One row per season.
 */
async function fetchLeagueAverages(
	seasonIds: number[],
): Promise<LeagueAverages[]> {
	if (seasonIds.length === 0) return [];

	const rows = await db
		.select({
			seasonId: games.seasonId,
			totalAtBats: sql<number>`SUM(${playerGamesStats.atBats})`,
			totalHits: sql<number>`SUM(${playerGamesStats.hits})`,
			totalWalks: sql<number>`SUM(${playerGamesStats.walks})`,
			totalRbis: sql<number>`SUM(${playerGamesStats.rbis})`,
			totalStrikeouts: sql<number>`SUM(${playerGamesStats.strikeouts})`,
			totalHomeRuns: sql<number>`SUM(${playerGamesStats.homeRuns})`,
			totalRunsAllowed: sql<number>`SUM(${playerGamesStats.runsAllowed})`,
			totalOutsPitched: sql<number>`SUM(${playerGamesStats.outsPitched})`,
			gamesPlayed: sql<number>`COUNT(DISTINCT ${teamGames.gameId})`,
		})
		.from(playerGamesStats)
		.innerJoin(teamGames, eq(teamGames.gameId, playerGamesStats.gameId))
		.innerJoin(games, eq(games.id, playerGamesStats.gameId))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				sql`${opponent.teamId} <> ${teamGames.teamId}`,
			),
		)
		.where(
			and(
				inArray(games.seasonId, seasonIds),
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(games.seasonId)
		.orderBy(games.seasonId);

	return rows.map((row) => {
		const seasonId = Number(row.seasonId);
		const totalAb = Number(row.totalAtBats ?? 0);
		const totalHits = Number(row.totalHits ?? 0);
		const totalWalks = Number(row.totalWalks ?? 0);
		const totalRbis = Number(row.totalRbis ?? 0);
		const totalK = Number(row.totalStrikeouts ?? 0);
		const totalHr = Number(row.totalHomeRuns ?? 0);
		const totalRa = Number(row.totalRunsAllowed ?? 0);
		const totalOp = Number(row.totalOutsPitched ?? 0);
		const gamesPlayed = Number(row.gamesPlayed ?? 0);

		const leagueAbPerGame =
			gamesPlayed > 0 ? totalAb / gamesPlayed / 2 : 0;
		const leagueAvg = totalAb > 0 ? totalHits / totalAb : 0;
		const denomObp = totalAb + totalWalks;
		const leagueObp =
			denomObp > 0 ? (totalHits + totalWalks) / denomObp : leagueAvg;
		const leagueRbiPerAb = totalAb > 0 ? totalRbis / totalAb : 0;
		const leagueKRate = totalAb > 0 ? totalK / totalAb : 0;
		const leagueHrPerAb = totalAb > 0 ? totalHr / totalAb : 0;
		const leagueRa9 = totalOp > 0 ? (totalRa / totalOp) * 27 : 0;
		const leagueKPer9 = totalOp > 0 ? (totalK / totalOp) * 27 : 0;

		return {
			seasonId,
			dataVersion: (seasonId <= 4 ? "legacy" : "new") as
				| "legacy"
				| "new",
			leagueAvg,
			leagueObp,
			leagueRbiPerAb,
			leagueKRate,
			leagueHrPerAb,
			leagueRa9,
			leagueKPer9,
			leagueAbPerGame,
		};
	});
}

/* -------------------------------------------------------------------------- */
/* Projection wrapper                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Build a ProjectionConfig with both calibration sets available. The
 * projector picks the right set per player-season row based on its
 * `dataVersion` flag, so the script doesn't need to choose.
 */
function configForSeasons(_seasonIds: number[]): ProjectionConfig {
	return {
		handTuned: DEFAULT_HAND_TUNED_CONFIG,
		calibration: {
			legacy: DEFAULT_LEGACY_CALIBRATION,
			new: DEFAULT_NEW_CALIBRATION,
		},
	};
}

/* -------------------------------------------------------------------------- */
/* Stats helpers                                                               */
/* -------------------------------------------------------------------------- */

function mean(xs: number[]): number {
	if (xs.length === 0) return 0;
	return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function meanAbs(xs: number[]): number {
	if (xs.length === 0) return 0;
	return xs.reduce((a, b) => a + Math.abs(b), 0) / xs.length;
}

function rmse(xs: number[]): number {
	if (xs.length === 0) return 0;
	const m = mean(xs.map((x) => x * x));
	return Math.sqrt(m);
}

function pearson(xs: number[], ys: number[]): number {
	const n = Math.min(xs.length, ys.length);
	if (n < 2) return 0;
	const mx = mean(xs);
	const my = mean(ys);
	let num = 0;
	let dx2 = 0;
	let dy2 = 0;
	for (let i = 0; i < n; i++) {
		const dx = xs[i] - mx;
		const dy = ys[i] - my;
		num += dx * dy;
		dx2 += dx * dx;
		dy2 += dy * dy;
	}
	const denom = Math.sqrt(dx2 * dy2);
	if (denom < 1e-12) return 0;
	return num / denom;
}

function fmt(n: number, decimals = 2): string {
	return n.toFixed(decimals);
}

function signedParens(n: number, decimals = 2): string {
	const s = fmt(Math.abs(n), decimals);
	return n >= 0 ? `+${s}` : `-${s}`;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

interface EvalRow {
	teamName: string;
	projectedRS: number;
	actualRS: number;
	rsError: number;
	projectedRA: number;
	actualRA: number;
	raError: number;
	projectedWinPct: number;
	actualWinPct: number;
	winPctError: number;
}

async function evaluateSeason(seasonId: number): Promise<EvalRow[]> {
	// History = all seasons up to and including the target.
	const historySeasons: number[] = [];
	for (let s = 1; s <= seasonId; s++) historySeasons.push(s);
	if (historySeasons.length === 0) return [];

	const [league, actuals] = await Promise.all([
		fetchLeagueAverages(historySeasons),
		fetchActualTeamStats(seasonId),
	]);
	if (league.length === 0 || actuals.length === 0) return [];

	const config = configForSeasons(historySeasons);

	// For each team, project using ALL available history, then compare
	// to the target season's actuals.
	const rows: EvalRow[] = [];
	for (const actual of actuals) {
		if (actual.games === 0) continue;
		const playerStats = await fetchRosterAggregates(
			actual.teamId,
			historySeasons,
		);
		if (playerStats.length === 0) {
			// No roster data — skip rather than emit a 0/0 row.
			continue;
		}
		const roster: RosterStats = {
			teamId: actual.teamId,
			players: playerStats,
			leagueAverages: league,
		};
		const projected: TeamProjection = projectRoster(roster, config);

		// Pythagorean win-pct, matching the odds engine's exponent.
		const exponent = Math.pow(2 * projected.projectedRS, 0.287);
		const projectedWinPct =
			projected.projectedRA > 0
				? Math.pow(projected.projectedRS, exponent) /
					(Math.pow(projected.projectedRS, exponent) +
						Math.pow(projected.projectedRA, exponent))
				: 0.5;
		const actualWinPct =
			actual.actualRA > 0
				? Math.pow(actual.actualRS, exponent) /
					(Math.pow(actual.actualRS, exponent) +
						Math.pow(actual.actualRA, exponent))
				: 0.5;

		rows.push({
			teamName: actual.teamName,
			projectedRS: projected.projectedRS,
			actualRS: actual.actualRS,
			rsError: projected.projectedRS - actual.actualRS,
			projectedRA: projected.projectedRA,
			actualRA: actual.actualRA,
			raError: projected.projectedRA - actual.actualRA,
			projectedWinPct,
			actualWinPct,
			winPctError: projectedWinPct - actualWinPct,
		});
	}

	rows.sort((a, b) => b.actualRS - a.actualRS);
	return rows;
}

function printTable(seasonId: number, rows: EvalRow[]): void {
	console.log(`\n=== Season ${seasonId} (${rows.length} teams) ===\n`);
	if (rows.length === 0) {
		console.log("  (no data — skipping)");
		return;
	}

	const headers = [
		"Team",
		"pRS",
		"aRS",
		"ΔRS",
		"pRA",
		"aRA",
		"ΔRA",
		"pW%",
		"aW%",
		"ΔW%",
	];
	const data = rows.map((r) => [
		r.teamName,
		fmt(r.projectedRS),
		fmt(r.actualRS),
		signedParens(r.rsError),
		fmt(r.projectedRA),
		fmt(r.actualRA),
		signedParens(r.raError),
		fmt(r.projectedWinPct * 100, 1),
		fmt(r.actualWinPct * 100, 1),
		signedParens(r.winPctError * 100, 1),
	]);

	// Compute column widths.
	const widths = headers.map((h) => h.length);
	for (const row of data) {
		for (let i = 0; i < row.length; i++) {
			widths[i] = Math.max(widths[i], row[i].length);
		}
	}

	const formatRow = (cells: string[]) =>
		cells.map((c, i) => c.padEnd(widths[i])).join("  ");

	console.log(formatRow(headers));
	console.log(widths.map((w) => "-".repeat(w)).join("  "));
	for (const row of data) console.log(formatRow(row));
}

function printSummary(allRows: EvalRow[]): void {
	if (allRows.length === 0) return;
	const rsErr = allRows.map((r) => r.rsError);
	const raErr = allRows.map((r) => r.raError);
	const wpErr = allRows.map((r) => r.winPctError);
	const projRS = allRows.map((r) => r.projectedRS);
	const actRS = allRows.map((r) => r.actualRS);
	const projRA = allRows.map((r) => r.projectedRA);
	const actRA = allRows.map((r) => r.actualRA);
	const projWP = allRows.map((r) => r.projectedWinPct);
	const actWP = allRows.map((r) => r.actualWinPct);

	console.log("\n=== Aggregate metrics ===\n");
	const table = [
		["Metric", "RS", "RA", "Win%"],
		[
			"Mean bias (signed)",
			signedParens(mean(rsErr)),
			signedParens(mean(raErr)),
			signedParens(mean(wpErr) * 100, 2) + " pts",
		],
		[
			"MAE",
			fmt(meanAbs(rsErr)),
			fmt(meanAbs(raErr)),
			fmt(meanAbs(wpErr) * 100, 2) + " pts",
		],
		[
			"RMSE",
			fmt(rmse(rsErr)),
			fmt(rmse(raErr)),
			fmt(rmse(wpErr) * 100, 2) + " pts",
		],
		[
			"Pearson (proj vs actual)",
			fmt(pearson(projRS, actRS), 3),
			fmt(pearson(projRA, actRA), 3),
			fmt(pearson(projWP, actWP), 3),
		],
	];
	const widths = table[0].map((h) => h.length);
	for (const row of table) {
		for (let i = 0; i < row.length; i++) {
			widths[i] = Math.max(widths[i], row[i].length);
		}
	}
	const fmtRow = (cells: string[]) =>
		cells.map((c, i) => c.padEnd(widths[i])).join("  ");
	for (const row of table) console.log(fmtRow(row));
}

async function main(): Promise<void> {
	console.log(
		`Evaluating with legacy=${JSON.stringify(DEFAULT_LEGACY_CALIBRATION)}`,
	);
	console.log(
		`              new=${JSON.stringify(DEFAULT_NEW_CALIBRATION)}`,
	);

	const allRows: EvalRow[] = [];
	for (const seasonId of targetSeasons) {
		const rows = await evaluateSeason(seasonId);
		printTable(seasonId, rows);
		allRows.push(...rows);
	}
	printSummary(allRows);
	process.exit(0);
}

void main();
