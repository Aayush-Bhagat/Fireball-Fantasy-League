import {
	computeMatchOdds,
	MatchOddsResult,
} from "@/lib/oddsEngine";
import {
	findHeadToHeadRecords,
	findLeagueRunEnvironment,
	findTeamRunAverages,
	HeadToHeadRecord,
	TeamRunAverages,
} from "@/repositories/oddsRepository";
import { GameData } from "@/dtos/gameDtos";

/**
 * Odds service.
 *
 * Computes win probabilities / moneylines for an entire season schedule in a
 * single batch (3 season-wide queries + in-memory math) rather than per-match
 * round-trips. Only games not yet played (no `teamOutcome`) receive odds —
 * completed games keep `odds = null` and the UI shows the final score.
 */

/** Returns the canonical H2H key for an unordered team-id pair. */
function h2hKey(teamAId: string, teamBId: string): string {
	return [teamAId, teamBId].sort().join("::");
}

interface H2HLookup {
	gamesPlayed: number;
	/** Wins by `teamAId` within the pair (the side that ordered the lookup). */
	winsFor: (teamAId: string) => number;
}

function buildH2HLookup(records: HeadToHeadRecord[]): Map<string, H2HLookup> {
	const map = new Map<string, { gamesPlayed: number; wins: Map<string, number> }>();

	for (const r of records) {
		const key = h2hKey(r.teamAId, r.teamBId);
		const entry =
			map.get(key) ?? { gamesPlayed: 0, wins: new Map<string, number>() };
		// Each ordered row contributes its gamesPlayed once; the two directed
		// rows for the same pair describe the same set of games, so we set the
		// count from whichever row we see (they agree).
		entry.gamesPlayed = r.gamesPlayed;
		entry.wins.set(r.teamAId, r.teamAWins);
		map.set(key, entry);
	}

	const lookup = new Map<string, H2HLookup>();
	for (const [key, entry] of map) {
		lookup.set(key, {
			gamesPlayed: entry.gamesPlayed,
			winsFor: (teamAId: string) => entry.wins.get(teamAId) ?? 0,
		});
	}
	return lookup;
}

/**
 * Compute odds for every upcoming game in `games`.
 * Returns a map keyed by gameId.
 */
export async function computeSeasonOdds(
	seasonId: number | null,
	games: GameData[],
): Promise<Map<string, MatchOddsResult>> {
	const upcoming = games.filter(
		(g) => g.teamOutcome === null && g.opponentOutcome === null,
	);

	const result = new Map<string, MatchOddsResult>();
	if (upcoming.length === 0) return result;

	const [env, teamAverages, h2hRecords] = await Promise.all([
		findLeagueRunEnvironment(seasonId),
		findTeamRunAverages(seasonId),
		findHeadToHeadRecords(seasonId),
	]);

	const averagesByTeam = new Map<string, TeamRunAverages>();
	for (const t of teamAverages) averagesByTeam.set(t.teamId, t);

	const h2h = buildH2HLookup(h2hRecords);

	for (const game of upcoming) {
		const team = averagesByTeam.get(game.teamId);
		const opp = averagesByTeam.get(game.opponentId);

		const h2hEntry = h2h.get(h2hKey(game.teamId, game.opponentId));

		const odds = computeMatchOdds({
			teamRunsScored: team?.runsScored ?? 0,
			teamRunsAllowed: team?.runsAllowed ?? 0,
			teamGamesPlayed: team?.gamesPlayed ?? 0,
			opponentRunsScored: opp?.runsScored ?? 0,
			opponentRunsAllowed: opp?.runsAllowed ?? 0,
			opponentGamesPlayed: opp?.gamesPlayed ?? 0,
			h2hGamesPlayed: h2hEntry?.gamesPlayed ?? 0,
			h2hTeamWins: h2hEntry?.winsFor(game.teamId) ?? 0,
			leagueRpg: env.leagueRpg,
		});

		result.set(game.gameId, odds);
	}

	return result;
}
