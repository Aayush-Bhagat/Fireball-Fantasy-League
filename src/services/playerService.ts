import {
	PlayerCareerStatsDto,
	PlayerGameStatsDto,
	PlayerHistoryDto,
	PlayerWithStatsDto,
} from "@/dtos/playerDtos";
import { calculateEra, calculateInningsPitched } from "@/lib/statUtils";
import { findPlayerGames } from "@/repositories/gameRepository";
import {
	findAllPlayers,
	findAllPlayerStats,
	findPlayerCareerStats,
	findPlayerHistoryByPlayer,
	findPlayerInfo,
} from "@/repositories/playerRepository";

export async function getPlayerGames(playerId: string) {
	const games = await findPlayerGames(playerId);

	const playerGames: PlayerGameStatsDto[] = games.map((game) => {
		return {
			gameId: game.gameId,
			week: game.week,
			playedAt: game.playedAt,
			team: {
				id: game.playerTeamId,
				name: game.playerTeamName,
				logo: game.playerTeamLogo,
				abbreviation: game.playerTeamAbbreviation,
				conference: game.playerTeamConferenceName,
				userId: game.playerTeamUserId,
			},
			opponent: {
				id: game.opponentTeamId,
				name: game.opponentTeamName,
				logo: game.opponentTeamLogo,
				abbreviation: game.opponentTeamAbbreviation,
				conference: game.opponentTeamConferenceName,
				userId: game.opponentTeamUserId,
			},
			teamScore: game.playerTeamScore,
			opponentScore: game.opponentTeamScore,
			teamOutcome: game.playerTeamOutcome,
			opponentOutcome: game.opponentTeamOutcome,
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
				gamesPlayed: 1,
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

export async function getAllPlayerStats() {
	const stats = await findAllPlayerStats();

	const allPlayers = await findAllPlayers();

	const allPlayersWithStats: PlayerWithStatsDto[] = allPlayers.map(
		(player) => {
			const stat = stats.find((s) => s.playerId === player.id);
			return {
				id: player.id,
				name: player.name,
				image: player.image,
				isCaptain: player.isCaptain,
				playerCardImage: player.playerCardImage,
				team: player.team
					? {
							id: player.team.id,
							name: player.team.name,
							logo: player.team.logo,
							abbreviation: player.team.abbreviation,
							conference: player.team.conference.name,
							userId: player.team.userId,
					  }
					: null,
				batting: player.batting,
				pitching: player.pitching,
				running: player.running,
				fielding: player.fielding,
				starSwing: player.starSwing,
				starPitch: player.starPitch,
				fieldingAbility: player.fieldingAbility,
				stats: {
					atBats: Number(stat?.atBats) || 0,
					hits: Number(stat?.hits) || 0,
					runs: Number(stat?.runs) || 0,
					rbis: Number(stat?.rbis) || 0,
					walks: Number(stat?.walks) || 0,
					strikeouts: Number(stat?.strikeouts) || 0,
					homeRuns: Number(stat?.homeRuns) || 0,
					inningsPitched: calculateInningsPitched(
						Number(stat?.outsPitched) || 0
					),
					runsAllowed: Number(stat?.runsAllowed) || 0,
					outs: Number(stat?.outs) || 0,
					battingAverage:
						Number(stat?.hits) / Number(stat?.atBats) || 0,
					era: calculateEra(
						Number(stat?.runsAllowed) || 0,
						Number(stat?.outsPitched) || 0
					),
					gamesPlayed: stat?.gamesPlayed || 0,
				},
			};
		}
	);

	return allPlayersWithStats;
}

export async function getPlayerCareerStats(playerId: string) {
	const stats = await findPlayerCareerStats(playerId);

	const playerInfo = await findPlayerInfo(playerId);

	if (!playerInfo) {
		throw new Error("Player not found");
	}

	const playerCareerStats: PlayerCareerStatsDto = {
		id: playerInfo.id,
		name: playerInfo.name,
		team: playerInfo.team
			? {
					id: playerInfo.team.id,
					name: playerInfo.team.name,
					logo: playerInfo.team.logo,
					abbreviation: playerInfo.team.abbreviation,
					conference: playerInfo.team.conference.name,
					userId: playerInfo.team.userId,
			  }
			: null,
		image: playerInfo.image,
		isCaptain: playerInfo.isCaptain,
		batting: playerInfo.batting,
		pitching: playerInfo.pitching,
		running: playerInfo.running,
		fielding: playerInfo.fielding,
		starSwing: playerInfo.starSwing,
		starPitch: playerInfo.starPitch,
		fieldingAbility: playerInfo.fieldingAbility,
		careerStats: stats.map((stat) => ({
			seasonId: stat.seasonId,
			playerId: stat.playerId,
			playerName: stat.playerName,
			homeRuns: Number(stat.homeRuns),
			atBats: Number(stat.atBats),
			hits: Number(stat.hits),
			runs: Number(stat.runs),
			rbis: Number(stat.RBIs),
			walks: Number(stat.walks),
			strikeouts: Number(stat.strikeouts),
			outsPitched: Number(stat.outsPitched),
			inningsPitched: calculateInningsPitched(stat.outsPitched),
			runsAllowed: Number(stat.runsAllowed),
			outs: Number(stat.outs),
			battingAverage: Number(stat.hits)
				? Number(stat.hits) / Number(stat.atBats)
				: 0,
			era: calculateEra(stat.runsAllowed, stat.outsPitched),
			teamsPlayedFor: stat.teamsPlayedFor,
		})),
	};

	return playerCareerStats;
}
