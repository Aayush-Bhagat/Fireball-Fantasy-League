import { PlayerGameDto, PlayerHistoryDto } from "@/dtos/playerDtos";
import { calculateInningsPitched } from "@/lib/statUtils";
import { calculateEra } from "@/lib/statUtils";
import { findPlayerGames } from "@/repositories/gameRepository";
import { findPlayerHistoryByPlayer } from "@/repositories/playerRepository";
export async function getPlayerGames(playerId: string) {
	const games = await findPlayerGames(playerId);

	const playerGames: PlayerGameDto[] = games.map((game) => {
		return {
			gameId: game.gameId,
			week: game.week,
			playedAt: game.playedAt,
			team: {
				id: game.teamId,
				name: game.teamName,
				logo: game.teamLogo,
				abbreviation: game.teamAbbreviation,
				conference: game.teamConference,
				userId: game.teamUserId,
			},
			opponent: {
				id: game.opponentId,
				name: game.opponentName,
				logo: game.opponentLogo,
				abbreviation: game.opponentAbbreviation,
				conference: game.opponentConference,
				userId: game.opponentUserId,
			},
			teamScore: game.teamScore,
			opponentScore: game.opponentScore,
			teamOutcome: game.teamOutcome,
			opponentOutcome: game.opponentOutcome,
			stats: {
				atBats: game.atBats,
				hits: game.hits,
				runs: game.runs,
				rbis: game.rbis,
				walks: game.walks,
				strikeouts: game.strikeouts,
				homeRuns: game.homeRuns,
				inningsPitched: calculateInningsPitched(game.outsPitched),
				runsAllowed: game.runsAllowed,
				outs: game.outs,
				battingAverage: game.hits / game.atBats,
				era: calculateEra(game.runsAllowed, game.outsPitched),
			},
		};
	});

	return playerGames;
}

export async function getPlayerHistory(playerId: string) {
	const history = await findPlayerHistoryByPlayer(playerId);

	const playerHistory: PlayerHistoryDto[] = history.map((h) => {
		return {
			id: h.id,
			team: {
				id: h.teamId,
				name: h.team.name,
				logo: h.team.logo,
				abbreviation: h.team.abbreviation,
				conference: h.team.conference.name,
				userId: h.team.userId,
			},
			seasonId: h.seasonId,
			tradeId: h.tradeId,
			playerId: h.playerId,
			draftRound: h.draftRound,
			draftPick: h.draftPick,
			teamId: h.teamId,
			type: h.type,
			createdAt: h.createdAt,
		};
	});

	return playerHistory;
}
