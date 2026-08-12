import {
	computeMatchOdds,
	MatchOddsResult,
} from "@/lib/oddsEngine";
import { GameData } from "@/dtos/gameDtos";

/**
 * Odds service.
 *
 * Computes win probabilities / moneylines for EVERY game on a season schedule
 * — completed *and* upcoming — as the **going-in odds**: each game's odds are
 * derived from only the games played *before* it (strictly earlier weeks), so
 * a game's own result never leaks into its own probability.
 *
 * All data is derived in-memory from the `games` array the caller already
 * loaded for the schedule, so this adds zero database round-trips. For a
 * fantasy league (tens of games) the O(weeks × games) pass is trivial.
 */

/** Returns the canonical H2H key for an unordered team-id pair. */
function h2hKey(teamAId: string, teamBId: string): string {
	return [teamAId, teamBId].sort().join("::");
}

interface TeamAgg {
	runsScored: number;
	runsAllowed: number;
	gamesPlayed: number;
}

interface H2HAgg {
	gamesPlayed: number;
	/** Wins keyed by teamId within this pair. */
	wins: Map<string, number>;
}

/** A game counts as "completed" once both team outcomes are recorded. */
function isCompleted(g: GameData): boolean {
	return g.teamOutcome !== null && g.opponentOutcome !== null;
}

/**
 * Compute going-in odds for every game in `games`, keyed by gameId.
 *
 * Processing is week-ordered: for each week we (1) snapshot odds for all of
 * that week's games against the running aggregates from prior weeks, then
 * (2) fold that week's completed games into the aggregates. This guarantees
 * same-week games never influence each other and a game's own result never
 * affects its own odds.
 */
export async function computeSeasonOdds(
	games: GameData[],
): Promise<Map<string, MatchOddsResult>> {
	const result = new Map<string, MatchOddsResult>();
	if (games.length === 0) return result;

	// Group games by week (stable within a week by insertion order).
	const byWeek = new Map<number, GameData[]>();
	for (const g of games) {
		const list = byWeek.get(g.week);
		if (list) list.push(g);
		else byWeek.set(g.week, [g]);
	}
	const weeks = [...byWeek.keys()].sort((a, b) => a - b);

	// Running aggregates over completed games from prior weeks.
	const teamAgg = new Map<string, TeamAgg>();
	const h2hAgg = new Map<string, H2HAgg>();
	let totalRuns = 0;
	let completedGames = 0;

	const getTeam = (id: string): TeamAgg =>
		teamAgg.get(id) ?? { runsScored: 0, runsAllowed: 0, gamesPlayed: 0 };

	const leagueRpg = () =>
		completedGames > 0 ? totalRuns / (2 * completedGames) : 0;

	/** Fold one completed game's results into the running aggregates. */
	const fold = (g: GameData) => {
		if (!isCompleted(g)) return;

		const teamScore = g.teamScore ?? 0;
		const oppScore = g.opponentScore ?? 0;

		// Team side: scored `teamScore`, allowed `oppScore`.
		const t = getTeam(g.teamId);
		t.runsScored += teamScore;
		t.runsAllowed += oppScore;
		t.gamesPlayed += 1;
		teamAgg.set(g.teamId, t);

		// Opponent side: scored `oppScore`, allowed `teamScore`.
		const o = getTeam(g.opponentId);
		o.runsScored += oppScore;
		o.runsAllowed += teamScore;
		o.gamesPlayed += 1;
		teamAgg.set(g.opponentId, o);

		// League run environment.
		totalRuns += teamScore + oppScore;
		completedGames += 1;

		// Head-to-head (ties count as a game played but a win for neither).
		const key = h2hKey(g.teamId, g.opponentId);
		const h = h2hAgg.get(key) ?? { gamesPlayed: 0, wins: new Map() };
		h.gamesPlayed += 1;
		h.wins.set(
			g.teamId,
			(h.wins.get(g.teamId) ?? 0) + (g.teamOutcome === "Win" ? 1 : 0),
		);
		h.wins.set(
			g.opponentId,
			(h.wins.get(g.opponentId) ?? 0) +
				(g.opponentOutcome === "Win" ? 1 : 0),
		);
		h2hAgg.set(key, h);
	};

	for (const week of weeks) {
		const weekGames = byWeek.get(week)!;

		// (1) Snapshot going-in odds for every game this week using only
		// aggregates from prior weeks.
		for (const g of weekGames) {
			const team = getTeam(g.teamId);
			const opp = getTeam(g.opponentId);
			const h2h = h2hAgg.get(h2hKey(g.teamId, g.opponentId));

			result.set(
				g.gameId,
				computeMatchOdds({
					teamRunsScored: team.runsScored,
					teamRunsAllowed: team.runsAllowed,
					teamGamesPlayed: team.gamesPlayed,
					opponentRunsScored: opp.runsScored,
					opponentRunsAllowed: opp.runsAllowed,
					opponentGamesPlayed: opp.gamesPlayed,
					h2hGamesPlayed: h2h?.gamesPlayed ?? 0,
					h2hTeamWins: h2h?.wins.get(g.teamId) ?? 0,
					leagueRpg: leagueRpg(),
				}),
			);
		}

		// (2) Fold this week's completed games into the running aggregates so
		// later weeks see them.
		for (const g of weekGames) fold(g);
	}

	return result;
}
