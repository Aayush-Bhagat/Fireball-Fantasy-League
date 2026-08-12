/**
 * Dynamic Match Odds & Win Probability Engine
 *
 * Pure math module. No DB access — pass in raw team/league/H2H metrics and
 * receive a fully-computed {@link MatchOddsResult}. Data fetching / assembly
 * lives in `src/services/oddsService.ts`.
 *
 * Model (see SRS §3):
 *   1. Dynamic Pythagenpat exponent:  x = (2 · L_R) ^ 0.287
 *   2. Season win expectancy:          W = RS^x / (RS^x + RA^x)
 *   3. Log5 matchup probability:       P_Log5(A) = (W_A - W_A·W_B) / (W_A + W_B - 2·W_A·W_B)
 *   4. Bayesian H2H shrinkage:        P_Final = (1 - w)·P_Log5 + w·P_H2H,  w = N / (N + M)
 *   5. American odds conversion from the final probability.
 */

/** Tunable engine configuration. */
export interface OddsEngineConfig {
	/** Bayesian prior weight (in games). SRS default is 10. */
	priorM: number;
	/** Fallback runs scored per game when a team has no completed games. */
	defaultRunsPerGame: number;
	/** Fallback league runs-per-game when no games are completed yet. */
	defaultLeagueRpg: number;
	/** A team is considered "cold" (sparse data) below this many games played. */
	coldStartThreshold: number;
	/** H2H sample at or below this count is flagged as sparse. */
	sparseH2HThreshold: number;
	/** Epsilon to avoid divide-by-zero in Log5 / Pythagorean terms. */
	epsilon: number;
}

export const DEFAULT_ODDS_CONFIG: OddsEngineConfig = {
	priorM: 10.0,
	defaultRunsPerGame: 4.5,
	defaultLeagueRpg: 9.0,
	coldStartThreshold: 3,
	sparseH2HThreshold: 3,
	epsilon: 1e-5,
};

/** Raw inputs required to compute a single matchup's odds. */
export interface MatchOddsInput {
	teamRunsScored: number;
	teamRunsAllowed: number;
	teamGamesPlayed: number;
	opponentRunsScored: number;
	opponentRunsAllowed: number;
	opponentGamesPlayed: number;
	/** Number of completed H2H games between the two teams this season. */
	h2hGamesPlayed: number;
	/** Number of those H2H games won by `team` (the schedule "team" side). */
	h2hTeamWins: number;
	/** League-wide average runs per game (per side), L_R. */
	leagueRpg: number;
	config?: Partial<OddsEngineConfig>;
}

/** Full output of the engine — powers both the badge and the detail drawer. */
export interface MatchOddsResult {
	teamProb: number;
	opponentProb: number;
	teamAmerican: number;
	opponentAmerican: number;
	h2hGamesPlayed: number;
	pythagenpatExponent: number;
	leagueRpg: number;
	teamRunsScored: number;
	teamRunsAllowed: number;
	opponentRunsScored: number;
	opponentRunsAllowed: number;
	teamGamesPlayed: number;
	opponentGamesPlayed: number;
	teamWinExpectancy: number;
	opponentWinExpectancy: number;
	log5Probability: number;
	h2hProbability: number | null;
	h2hWeight: number;
	priorM: number;
	sparseSample: boolean;
	coldStart: boolean;
}

/**
 * Dynamic Pythagenpat exponent derived from league runs-per-game environment.
 *   x = (2 · L_R) ^ 0.287
 */
export function pythagenpatExponent(leagueRpg: number): number {
	const rpg = Math.max(leagueRpg, 0);
	return Math.pow(2 * rpg, 0.287);
}

/**
 * Season win expectancy from average runs scored / allowed:
 *   W = RS^x / (RS^x + RA^x)
 */
export function pythagoreanWinExpectancy(
	runsScored: number,
	runsAllowed: number,
	exponent: number,
	epsilon = DEFAULT_ODDS_CONFIG.epsilon,
): number {
	const rs = Math.max(runsScored, 0);
	const ra = Math.max(runsAllowed, 0);
	const rsX = Math.pow(rs, exponent);
	const raX = Math.pow(ra, exponent);
	return rsX / (rsX + raX + epsilon);
}

/**
 * Bill James's Log5 matchup probability — probability that team A beats team B
 * given their independent win expectancies W_A and W_B:
 *   P(A) = (W_A - W_A·W_B) / (W_A + W_B - 2·W_A·W_B)
 */
export function log5Probability(
	wA: number,
	wB: number,
	epsilon = DEFAULT_ODDS_CONFIG.epsilon,
): number {
	const numerator = wA - wA * wB;
	const denominator = wA + wB - 2 * wA * wB;
	return numerator / (denominator + epsilon);
}

/**
 * Bayesian shrinkage blend of the Log5 prior with the limited H2H sample.
 *   w = N / (N + M)
 *   P_Final = (1 - w)·P_Log5 + w·P_H2H
 *
 * When there is no H2H data (N = 0) the Log5 baseline is used unmodified.
 */
export function bayesianShrinkage(
	pLog5: number,
	pH2H: number | null,
	nH2H: number,
	priorM: number,
): { pFinal: number; weight: number; pEffectiveH2H: number | null } {
	if (nH2H <= 0 || pH2H === null) {
		return { pFinal: pLog5, weight: 0, pEffectiveH2H: null };
	}
	const w = nH2H / (nH2H + priorM);
	return {
		pFinal: (1 - w) * pLog5 + w * pH2H,
		weight: w,
		pEffectiveH2H: pH2H,
	};
}

/**
 * Convert a win probability in [0,1] to American moneyline odds.
 *   Favorite (P >= 0.5):  -floor(P / (1-P) * 100)
 *   Underdog (P <  0.5):  +floor((1-P) / P * 100)
 *
 * A 50/50 matchup yields +100 (even money).
 */
export function toAmericanOdds(p: number): number {
	const clamped = Math.min(Math.max(p, 1e-6), 1 - 1e-6);
	if (clamped >= 0.5) {
		return -Math.floor((clamped / (1 - clamped)) * 100);
	}
	return Math.floor(((1 - clamped) / clamped) * 100);
}

/** Round to a fixed number of decimals while keeping a number type. */
function round(value: number, decimals: number): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/**
 * Run the full pipeline for a single matchup. Pure — safe to unit test and
 * safe to call for many games in a loop.
 */
export function computeMatchOdds(input: MatchOddsInput): MatchOddsResult {
	const cfg = { ...DEFAULT_ODDS_CONFIG, ...input.config };

	const leagueRpg =
		input.leagueRpg > 0 ? input.leagueRpg : cfg.defaultLeagueRpg;
	const exponent = pythagenpatExponent(leagueRpg);

	// Cold-start: teams with very few games regress toward league-average
	// runs (≈ half the league total), which yields ~0.500 Pythagorean win
	// expectancy. We blend their actual RS/RA with the default proportionally
	// to how many games they've played.
	const blend = (actual: number, gamesPlayed: number) => {
		if (gamesPlayed >= cfg.coldStartThreshold || actual > 0) return actual;
		// No data at all → fall back to league-average-ish baseline.
		return cfg.defaultRunsPerGame;
	};

	const teamRS = blend(input.teamRunsScored, input.teamGamesPlayed);
	const teamRA = blend(input.teamRunsAllowed, input.teamGamesPlayed);
	const oppRS = blend(input.opponentRunsScored, input.opponentGamesPlayed);
	const oppRA = blend(input.opponentRunsAllowed, input.opponentGamesPlayed);

	const wTeam = pythagoreanWinExpectancy(teamRS, teamRA, exponent, cfg.epsilon);
	const wOpp = pythagoreanWinExpectancy(oppRS, oppRA, exponent, cfg.epsilon);

	const pLog5Team = log5Probability(wTeam, wOpp, cfg.epsilon);

	const nH2H = input.h2hGamesPlayed;
	const pH2HTeam =
		nH2H > 0 ? input.h2hTeamWins / nH2H : null;

	const { pFinal: pFinalTeam, weight: h2hWeight } = bayesianShrinkage(
		pLog5Team,
		pH2HTeam,
		nH2H,
		cfg.priorM,
	);

	const pFinalOpp = 1 - pFinalTeam;

	const coldStart =
		input.teamGamesPlayed < cfg.coldStartThreshold ||
		input.opponentGamesPlayed < cfg.coldStartThreshold;

	return {
		teamProb: round(pFinalTeam, 4),
		opponentProb: round(pFinalOpp, 4),
		teamAmerican: toAmericanOdds(pFinalTeam),
		opponentAmerican: toAmericanOdds(pFinalOpp),
		h2hGamesPlayed: nH2H,
		pythagenpatExponent: round(exponent, 3),
		leagueRpg: round(leagueRpg, 3),
		teamRunsScored: round(teamRS, 3),
		teamRunsAllowed: round(teamRA, 3),
		opponentRunsScored: round(oppRS, 3),
		opponentRunsAllowed: round(oppRA, 3),
		teamGamesPlayed: input.teamGamesPlayed,
		opponentGamesPlayed: input.opponentGamesPlayed,
		teamWinExpectancy: round(wTeam, 4),
		opponentWinExpectancy: round(wOpp, 4),
		log5Probability: round(pLog5Team, 4),
		h2hProbability: pH2HTeam === null ? null : round(pH2HTeam, 4),
		h2hWeight: round(h2hWeight, 4),
		priorM: cfg.priorM,
		sparseSample: nH2H <= cfg.sparseH2HThreshold,
		coldStart,
	};
}
