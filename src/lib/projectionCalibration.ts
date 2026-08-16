/**
 * Roster-projection calibration helpers.
 *
 * Offline only — never called by the projector at runtime. Run once via
 *   npx tsx src/lib/projectionCalibration.ts
 * to produce fitted coefficients, then paste them into
 * `DEFAULT_LEGACY_CALIBRATION` / `DEFAULT_NEW_CALIBRATION` in
 * `src/dtos/projectionDtos.ts` (or load them from a JSON file via
 * `loadCalibrationCoefficients` in the projection service).
 *
 * Two stages:
 *
 *   1. `extractCalibrationDataset(seasonIds)` — pulls one row per
 *      (team, season) with team-level RS / RA / AVG / SLG / K rate /
 *      HR rate / RBI rate / K/9 / RA/9.
 *   2. `fitCalibration(dataset)` — fits the offensive and pitching
 *      regressions per data version, returning
 *      {@link CalibrationCoefficients}.
 *
 * The math is plain TypeScript (no scipy / sklearn) using normal
 * equations on the design matrix. Tiny matrices — 3×3 for the
 * offensive fit, 2×2 for the pitching fit — so the Gauss-Jordan
 * inversion below is more than fast enough.
 */

import { sql, eq, and, ne, isNotNull, avg } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { games, teamGames } from "@/models/games";
import { playerGamesStats } from "@/models/players";
import {
	CalibrationConfig,
	CalibrationCoefficients,
	CalibrationDataset,
	DataVersion,
} from "@/dtos/projectionDtos";

/* -------------------------------------------------------------------------- */
/* Stage 1 — Dataset extraction                                                */
/* -------------------------------------------------------------------------- */

/**
 * Pull one row per (team, season) with every team-level rate stat the
 * regression needs.
 *
 * SQL notes:
 * - Opponent side is joined via `alias(teamGames, "opponent")` so a
 *   single game is represented once per team (not double-counted). Same
 *   pattern as `oddsRepository.findTeamRunAverages`.
 * - Player stats are joined at the (game, team) level so the SUMs cover
 *   every batter and pitcher the team fielded in that game.
 * - `dataVersion` is derived from `seasonId <= 4` to match the rest of
 *   the codebase's `legacySeasonCutoff` convention.
 */
export async function extractCalibrationDataset(
	seasonIds: number[],
): Promise<CalibrationDataset[]> {
	if (seasonIds.length === 0) return [];

	const opponent = alias(teamGames, "opponent");

	// Compute team-level AB/H/R/RBI/HR/K totals summed across all players
	// the team fielded in each game, then sum across all games. AVG, K
	// rate, HR/AB etc. are derived as ratios of those totals.
	const rows = await db
		.select({
			teamId: teamGames.teamId,
			seasonId: games.seasonId,
			teamRunsScored: avg(teamGames.score),
			teamRunsAllowed: avg(opponent.score),
			teamAtBats: sql<number>`SUM(${playerGamesStats.atBats})`,
			teamHits: sql<number>`SUM(${playerGamesStats.hits})`,
			teamRuns: sql<number>`SUM(${playerGamesStats.runs})`,
			teamRbis: sql<number>`SUM(${playerGamesStats.rbis})`,
			teamStrikeouts: sql<number>`SUM(${playerGamesStats.strikeouts})`,
			teamHomeRuns: sql<number>`SUM(${playerGamesStats.homeRuns})`,
			teamOutsPitched: sql<number>`SUM(${playerGamesStats.outsPitched})`,
			teamRunsAllowedTotal: sql<number>`SUM(${playerGamesStats.runsAllowed})`,
			teamGames: sql<number>`COUNT(DISTINCT ${teamGames.gameId})`,
		})
		.from(teamGames)
		.innerJoin(games, eq(teamGames.gameId, games.id))
		.innerJoin(
			opponent,
			and(
				eq(opponent.gameId, teamGames.gameId),
				ne(opponent.teamId, teamGames.teamId),
			),
		)
		.leftJoin(
			playerGamesStats,
			and(
				eq(playerGamesStats.gameId, teamGames.gameId),
				eq(playerGamesStats.teamId, teamGames.teamId),
			),
		)
		.where(
			and(
				sql`${games.seasonId} = ANY(${sql.raw(`ARRAY[${seasonIds.join(",")}]::integer[]`)})`,
				isNotNull(teamGames.outcome),
			),
		)
		.groupBy(teamGames.teamId, games.seasonId);

	return rows.map((row) => {
		const seasonId = Number(row.seasonId);
		const dataVersion: DataVersion = seasonId <= 4 ? "legacy" : "new";

		const teamAb = Number(row.teamAtBats ?? 0);
		const teamHits = Number(row.teamHits ?? 0);
		const teamHr = Number(row.teamHomeRuns ?? 0);
		const teamK = Number(row.teamStrikeouts ?? 0);
		const teamRbi = Number(row.teamRbis ?? 0);
		const teamRa = Number(row.teamRunsAllowedTotal ?? 0);
		const teamOp = Number(row.teamOutsPitched ?? 0);
		const teamGames_ = Number(row.teamGames ?? 0);
		const leagueAbPerGame = teamGames_ > 0 ? teamAb / teamGames_ : 0;

		const teamAvg = teamAb > 0 ? teamHits / teamAb : 0;
		const teamSlgApprox = teamAvg + (teamAb > 0 ? teamHr / teamAb : 0) * 2.0;
		const teamKRate = teamAb > 0 ? teamK / teamAb : 0;
		const teamHrPerAb = teamAb > 0 ? teamHr / teamAb : 0;
		const teamRbiPerAb = teamAb > 0 ? teamRbi / teamAb : 0;
		const teamRa9 = teamOp > 0 ? (teamRa / teamOp) * 27 : 0;
		const teamKPer9 = teamOp > 0 ? (teamK / teamOp) * 27 : 0;

		return {
			teamId: row.teamId,
			seasonId,
			dataVersion,
			teamRunsScored: Number(row.teamRunsScored ?? 0),
			teamRunsAllowed: Number(row.teamRunsAllowed ?? 0),
			teamAvg,
			teamSlgApprox,
			teamKRate,
			teamHrPerAb,
			teamRbiPerAb,
			teamKPer9,
			teamRa9,
			leagueAbPerGame,
		};
	});
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — Fit                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fit the offensive linear-weights regression per data version:
 *
 *   teamRunsScored / leagueAbPerGame = wAVG · AVG
 *                                  + wSLG · SLG_approx
 *                                  + runRateConstant
 *
 * Returns the coefficients as a partial CalibrationConfig (without the
 * pitching-side fields populated).
 */
function fitOffensive(
	dataset: CalibrationDataset[],
): Record<DataVersion, Pick<CalibrationConfig, "wAVG" | "wSLG" | "runRateConstant">> {
	const out: Record<
		DataVersion,
		Pick<CalibrationConfig, "wAVG" | "wSLG" | "runRateConstant">
	> = {
		legacy: { wAVG: 0, wSLG: 0, runRateConstant: 0 },
		new: { wAVG: 0, wSLG: 0, runRateConstant: 0 },
	};

	for (const version of ["legacy", "new"] as DataVersion[]) {
		const rows = dataset.filter(
			(d) =>
				d.dataVersion === version &&
				d.leagueAbPerGame > 0 &&
				(d.teamAvg > 0 || d.teamSlgApprox > 0),
		);
		if (rows.length < 3) {
			// Not enough data to fit — leave zeros. Caller should warn.
			continue;
		}
		// Design matrix: [1, teamAvg, teamSlgApprox]
		const X = rows.map((d) => [1, d.teamAvg, d.teamSlgApprox]);
		// Target: per-AB run production, normalized so the coefficients
		// are expressed in runs per AB (multiplied back by leagueAbPerGame
		// at inference time).
		const y = rows.map(
			(d) => d.teamRunsScored / d.leagueAbPerGame,
		);
		const beta = solveNormalEquations(X, y);
		if (!beta) continue;
		out[version] = {
			wAVG: beta[1] ?? 0,
			wSLG: beta[2] ?? 0,
			runRateConstant: beta[0] ?? 0,
		};
	}
	return out;
}

/**
 * Fit the pitching regression per data version:
 *
 *   teamRa9 = kCoefficient · teamKPer9 + eraConstant
 */
function fitPitching(
	dataset: CalibrationDataset[],
): Record<DataVersion, Pick<CalibrationConfig, "kCoefficient" | "eraConstant">> {
	const out: Record<
		DataVersion,
		Pick<CalibrationConfig, "kCoefficient" | "eraConstant">
	> = {
		legacy: { kCoefficient: 0, eraConstant: 0 },
		new: { kCoefficient: 0, eraConstant: 0 },
	};

	for (const version of ["legacy", "new"] as DataVersion[]) {
		const rows = dataset.filter(
			(d) => d.dataVersion === version && (d.teamKPer9 > 0 || d.teamRa9 > 0),
		);
		if (rows.length < 2) continue;
		const X = rows.map((d) => [1, d.teamKPer9]);
		const y = rows.map((d) => d.teamRa9);
		const beta = solveNormalEquations(X, y);
		if (!beta) continue;
		out[version] = {
			kCoefficient: beta[1] ?? 0,
			eraConstant: beta[0] ?? 0,
		};
	}
	return out;
}

/**
 * Fit both regressions and return the full {@link CalibrationCoefficients}
 * keyed by data version.
 */
export function fitCalibration(
	dataset: CalibrationDataset[],
): CalibrationCoefficients {
	const offensive = fitOffensive(dataset);
	const pitching = fitPitching(dataset);

	return {
		legacy: {
			...offensive.legacy,
			...pitching.legacy,
		},
		new: {
			...offensive.new,
			...pitching.new,
		},
	};
}

/* -------------------------------------------------------------------------- */
/* Normal equations solver                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Solve β = (X'X)^(-1) X'y for a small linear system using normal
 * equations with Gauss-Jordan matrix inversion. Returns null if the
 * system is singular (degenerate input).
 *
 * Expects `X` to be a 2D array (rows = observations, cols = features —
 * caller is responsible for including the intercept column if desired).
 */
function solveNormalEquations(
	X: number[][],
	y: number[],
): number[] | null {
	if (X.length === 0 || X[0].length === 0) return null;
	const k = X[0].length;
	const xtx: number[][] = Array.from({ length: k }, () =>
		new Array(k).fill(0),
	);
	const xty: number[] = new Array(k).fill(0);
	for (let i = 0; i < X.length; i++) {
		const row = X[i];
		const yi = y[i];
		for (let a = 0; a < k; a++) {
			xty[a] += row[a] * yi;
			for (let b = 0; b < k; b++) {
				xtx[a][b] += row[a] * row[b];
			}
		}
	}

	const inv = invertMatrix(xtx);
	if (!inv) return null;
	const beta = new Array(k).fill(0);
	for (let i = 0; i < k; i++) {
		for (let j = 0; j < k; j++) {
			beta[i] += inv[i][j] * xty[j];
		}
	}
	return beta;
}

/**
 * Invert a square matrix in place using Gauss-Jordan elimination with
 * partial pivoting. Returns null if the matrix is singular.
 */
function invertMatrix(M: number[][]): number[][] | null {
	const n = M.length;
	if (n === 0 || M.some((row) => row.length !== n)) return null;
	// Build augmented [M | I].
	const aug: number[][] = M.map((row, i) => [
		...row,
		...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
	]);

	for (let col = 0; col < n; col++) {
		// Pivot: find the largest absolute value in this column at or
		// below the current row.
		let pivotRow = col;
		let pivotVal = Math.abs(aug[col][col]);
		for (let r = col + 1; r < n; r++) {
			const v = Math.abs(aug[r][col]);
			if (v > pivotVal) {
				pivotRow = r;
				pivotVal = v;
			}
		}
		if (pivotVal < 1e-12) return null;
		if (pivotRow !== col) {
			[aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
		}
		// Normalize pivot row.
		const pivot = aug[col][col];
		for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
		// Eliminate the column in every other row.
		for (let r = 0; r < n; r++) {
			if (r === col) continue;
			const factor = aug[r][col];
			if (factor === 0) continue;
			for (let j = 0; j < 2 * n; j++) {
				aug[r][j] -= factor * aug[col][j];
			}
		}
	}

	return aug.map((row) => row.slice(n));
}

/* -------------------------------------------------------------------------- */
/* CLI entry point — `npx tsx src/lib/projectionCalibration.ts`                */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
	const seasonArg = process.argv[2];
	if (!seasonArg) {
		console.error(
			"Usage: npx tsx src/lib/projectionCalibration.ts <seasonIds...>\n" +
				"Example: npx tsx src/lib/projectionCalibration.ts 1 2 3 4",
		);
		process.exit(1);
	}

	const seasonIds = seasonArg
		.split(/[\s,]+/)
		.map((s) => Number(s))
		.filter((n) => Number.isFinite(n) && n > 0);
	if (seasonIds.length === 0) {
		console.error("No valid season ids provided.");
		process.exit(1);
	}

	console.log(
		`Extracting calibration dataset for seasons [${seasonIds.join(", ")}]...`,
	);
	const dataset = await extractCalibrationDataset(seasonIds);
	console.log(`  ${dataset.length} (team, season) rows extracted.`);

	console.log("Fitting regressions...");
	const coeffs = fitCalibration(dataset);
	for (const v of ["legacy", "new"] as DataVersion[]) {
		const c = coeffs[v];
		console.log(`\n[${v}]`);
		console.log(`  wAVG:           ${c.wAVG.toFixed(4)}`);
		console.log(`  wSLG:           ${c.wSLG.toFixed(4)}`);
		console.log(`  runRateConstant:${c.runRateConstant.toFixed(4)}`);
		console.log(`  kCoefficient:   ${c.kCoefficient.toFixed(4)}`);
		console.log(`  eraConstant:    ${c.eraConstant.toFixed(4)}`);
	}

	console.log(
		"\nPaste these values into DEFAULT_LEGACY_CALIBRATION / DEFAULT_NEW_CALIBRATION",
	);
	console.log(
		"in src/dtos/projectionDtos.ts (or load via loadCalibrationCoefficients).",
	);

	process.exit(0);
}

// Run only when invoked directly (not when imported).
if (
	process.argv[1] &&
	process.argv[1].endsWith("projectionCalibration.ts")
) {
	void main();
}