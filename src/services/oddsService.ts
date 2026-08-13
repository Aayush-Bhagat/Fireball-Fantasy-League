import {
	computeMatchOdds,
	MatchOddsResult,
} from "@/lib/oddsEngine";
import { GameData, MatchOddsDto, TeamPairOddsDto } from "@/dtos/gameDtos";
import {
	findHeadToHeadRecords,
	findLeagueRunEnvironment,
	findTeamRunAverages,
	HeadToHeadRecord,
	TeamRunAverages,
} from "@/repositories/oddsRepository";
import { findAllTeams } from "@/repositories/teamRepository";

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
					teamRunsScored:
						team.gamesPlayed > 0
							? team.runsScored / team.gamesPlayed
							: 0,
					teamRunsAllowed:
						team.gamesPlayed > 0
							? team.runsAllowed / team.gamesPlayed
							: 0,
					teamGamesPlayed: team.gamesPlayed,
					opponentRunsScored:
						opp.gamesPlayed > 0
							? opp.runsScored / opp.gamesPlayed
							: 0,
					opponentRunsAllowed:
						opp.gamesPlayed > 0
							? opp.runsAllowed / opp.gamesPlayed
							: 0,
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

function buildH2HLookup(records: HeadToHeadRecord[]) {
	const map = new Map<
		string,
		{ gamesPlayed: number; wins: Map<string, number> }
	>();
	for (const r of records) {
		const key = h2hKey(r.teamAId, r.teamBId);
		const entry =
			map.get(key) ?? { gamesPlayed: 0, wins: new Map() };
		entry.gamesPlayed = r.gamesPlayed;
		entry.wins.set(r.teamAId, r.teamAWins);
		map.set(key, entry);
	}
	return map;
}

/** Map an engine {@link MatchOddsResult} to the serializable {@link MatchOddsDto}. */
function toDto(r: MatchOddsResult): MatchOddsDto {
	return {
		...r,
	};
}

/**
 * Compute odds for an arbitrary team pair based on the season so far.
 *
 * Unlike the going-in schedule odds (which exclude a game's own result), this
 * uses season-to-date aggregates over ALL completed games — the right model
 * for a hypothetical next matchup between the two selected teams. The team
 * the caller passes as `teamAId` becomes the "team" perspective of the
 * returned odds.
 */
export async function computePairOdds(
	seasonId: number | null,
	teamAId: string,
	teamBId: string,
): Promise<TeamPairOddsDto> {
	if (teamAId === teamBId) {
		throw new Error("Cannot compute odds between a team and itself.");
	}

	const [env, teamAverages, h2hRecords, allTeams] = await Promise.all([
		findLeagueRunEnvironment(seasonId),
		findTeamRunAverages(seasonId),
		findHeadToHeadRecords(seasonId),
		findAllTeams(),
	]);

	const averagesByTeam = new Map<string, TeamRunAverages>();
	for (const t of teamAverages) averagesByTeam.set(t.teamId, t);

	const h2h = buildH2HLookup(h2hRecords).get(h2hKey(teamAId, teamBId));

	const teamA = averagesByTeam.get(teamAId);
	const teamB = averagesByTeam.get(teamBId);

	const odds = computeMatchOdds({
		teamRunsScored: teamA?.runsScored ?? 0,
		teamRunsAllowed: teamA?.runsAllowed ?? 0,
		teamGamesPlayed: teamA?.gamesPlayed ?? 0,
		opponentRunsScored: teamB?.runsScored ?? 0,
		opponentRunsAllowed: teamB?.runsAllowed ?? 0,
		opponentGamesPlayed: teamB?.gamesPlayed ?? 0,
		h2hGamesPlayed: h2h?.gamesPlayed ?? 0,
		h2hTeamWins: h2h?.wins.get(teamAId) ?? 0,
		leagueRpg: env.leagueRpg,
	});

	// Look up team display info for the response.
	const teamAInfo = allTeams.find((t) => t.id === teamAId);
	const teamBInfo = allTeams.find((t) => t.id === teamBId);

	return {
		teamA: {
			id: teamAId,
			name: teamAInfo?.name ?? "Team A",
			logo: teamAInfo?.logo ?? null,
			abbreviation: teamAInfo?.abbreviation ?? "A",
		},
		teamB: {
			id: teamBId,
			name: teamBInfo?.name ?? "Team B",
			logo: teamBInfo?.logo ?? null,
			abbreviation: teamBInfo?.abbreviation ?? "B",
		},
		odds: toDto(odds),
	};
}
