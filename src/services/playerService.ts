import { PlayerAward } from "@/dtos/awardDtos";
import {
	PlayerCareerStatsDto,
	PlayerGameStatsDto,
	PlayerHistoryDto,
	PlayerWithStatsDto,
} from "@/dtos/playerDtos";
import {
	calculateBAA,
	calculateEra,
	calculateInningsPitched,
	calculateOBP,
	calculateOBPAgainst,
	calculateOPS,
	calculateOPSAgainst,
	calculateSLG,
	calculateSLGAgainst,
	calculateWHIP,
	convertStringToNumber,
} from "@/lib/statUtils";
import { findPlayerGames } from "@/repositories/gameRepository";
import {
	findAllPlayers,
	findAllPlayerStats,
	findFreeAgents,
	findPlayerAwards,
	findPlayerCareerStats,
	findPlayerHistoryByPlayer,
	findPlayerInfo,
} from "@/repositories/playerRepository";

export async function getPlayerGames(playerId: string, season?: string) {
	const games = await findPlayerGames(playerId, season);

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

				// Batting
				walksTaken: game.walksTaken,
				outsPitched: game.outsPitched,
				plateAppearances: game.plateAppearances,
				strikeoutsBatted: game.strikeoutsBatted,
				hitByPitch: game.hitByPitch,
				singles: game.singles,
				doubles: game.doubles,
				triples: game.triples,
				oneHr: game.oneHr,
				twoHr: game.twoHr,
				threeHr: game.threeHr,
				grandSlams: game.grandSlams,
				totalBases: game.totalBases,
				sacFlies: game.sacFlies,
				startHits: game.startHits,
				starsUsedBatting: game.starsUsedBatting,

				// Baserunning
				stolenBases: game.stolenBases,
				caughtStealing: game.caughtStealing,
				stealAttempts: game.stealAttempts,

				// Fielding
				putout: game.putout,
				assist: game.assist,
				fieldingErrors: game.fieldingErrors,
				buddyJumpPutouts: game.buddyJumpPutouts,
				buddyJumpAttempts: game.buddyJumpAttempts,
				doublePlays: game.doublePlays,
				triplePlays: game.triplePlays,
				bobbles: game.bobbles,

				// Pitching
				battersFaced: game.battersFaced,
				pitches: game.pitches,
				strikes: game.strikes,
				balls: game.balls,
				beanBalls: game.beanBalls,
				hitsAllowed: game.hitsAllowed,
				singlesAllowed: game.singlesAllowed,
				doublesAllowed: game.doublesAllowed,
				triplesAllowed: game.triplesAllowed,
				homeRunsAllowed: game.homeRunsAllowed,
				inheritedRuns: game.inheritedRuns,
				starPitches: game.starPitches,
				starsUsedPitching: game.starsUsedPitching,
				pickoffs: game.pickoffs,
				pickoffAttempts: game.pickoffAttempts,
				obp: calculateOBP(
					game.hits,
					game.walksTaken,
					game.hitByPitch,
					game.atBats,
					game.sacFlies,
				),
				slg: calculateSLG(
					game.hits,
					game.singles,
					game.doubles,
					game.triples,
					game.homeRuns,
					game.atBats,
				),
				ops: calculateOPS(
					calculateOBP(
						game.hits,
						game.walksTaken,
						game.hitByPitch,
						game.atBats,
						game.sacFlies,
					),
					calculateSLG(
						game.hits,
						game.singles,
						game.doubles,
						game.triples,
						game.homeRuns,
						game.atBats,
					),
				),
				whip: calculateWHIP(
					game.walks,
					game.hitsAllowed,
					game.outsPitched,
				),
				baa: calculateBAA(game.hitsAllowed, game.battersFaced),
				obpAgainst: calculateOBPAgainst(
					game.hitsAllowed,
					game.walks,
					game.battersFaced,
				),
				slgAgainst: calculateSLGAgainst(
					game.hitsAllowed,
					game.singlesAllowed,
					game.doublesAllowed,
					game.triplesAllowed,
					game.homeRunsAllowed,
					game.battersFaced,
				),
				opsAgainst: calculateOPSAgainst(
					calculateOBPAgainst(
						game.hitsAllowed,
						game.walks,
						game.battersFaced,
					),
					calculateSLGAgainst(
						game.hitsAllowed,
						game.singlesAllowed,
						game.doublesAllowed,
						game.triplesAllowed,
						game.homeRunsAllowed,
						game.battersFaced,
					),
				),
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

export async function getAllPlayerStats(season?: string) {
	const stats = await findAllPlayerStats(season);

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
				teamId: player.teamId,
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
				position: player.teamLineups?.fieldingPosition || null,
				stats: {
					atBats: Number(stat?.atBats) || 0,
					hits: Number(stat?.hits) || 0,
					runs: Number(stat?.runs) || 0,
					rbis: Number(stat?.rbis) || 0,
					walks: Number(stat?.walks) || 0,
					strikeouts: Number(stat?.strikeouts) || 0,
					homeRuns: Number(stat?.homeRuns) || 0,
					inningsPitched: calculateInningsPitched(
						Number(stat?.outsPitched) || 0,
					),
					runsAllowed: Number(stat?.runsAllowed) || 0,
					outs: Number(stat?.outs) || 0,
					battingAverage:
						Number(stat?.hits) / Number(stat?.atBats) || 0,
					era: calculateEra(
						Number(stat?.runsAllowed) || 0,
						Number(stat?.outsPitched) || 0,
					),
					gamesPlayed: stat?.gamesPlayed || 0,

					// Batting
					outsPitched: Number(stat?.outsPitched) || 0,
					plateAppearances: convertStringToNumber(
						stat?.plateAppearances,
					),
					strikeoutsBatted: convertStringToNumber(
						stat?.strikeoutsBatted,
					),
					walksTaken: convertStringToNumber(stat?.walksTaken),
					hitByPitch: convertStringToNumber(stat?.hitByPitch),
					singles: convertStringToNumber(stat?.singles),
					doubles: convertStringToNumber(stat?.doubles),
					triples: convertStringToNumber(stat?.triples),
					oneHr: convertStringToNumber(stat?.oneHr),
					twoHr: convertStringToNumber(stat?.twoHr),
					threeHr: convertStringToNumber(stat?.threeHr),
					grandSlams: convertStringToNumber(stat?.grandSlams),
					totalBases: convertStringToNumber(stat?.totalBases),
					sacFlies: convertStringToNumber(stat?.sacFlies),
					startHits: convertStringToNumber(stat?.startHits),
					starsUsedBatting: convertStringToNumber(
						stat?.starsUsedBatting,
					),

					// Baserunning
					stolenBases: convertStringToNumber(stat?.stolenBases),
					caughtStealing: convertStringToNumber(stat?.caughtStealing),
					stealAttempts: convertStringToNumber(stat?.stealAttempts),

					// Fielding
					putout: convertStringToNumber(stat?.putout),
					assist: convertStringToNumber(stat?.assist),
					fieldingErrors: convertStringToNumber(stat?.fieldingErrors),
					buddyJumpPutouts: convertStringToNumber(
						stat?.buddyJumpPutouts,
					),
					buddyJumpAttempts: convertStringToNumber(
						stat?.buddyJumpAttempts,
					),
					doublePlays: convertStringToNumber(stat?.doublePlays),
					triplePlays: convertStringToNumber(stat?.triplePlays),
					bobbles: convertStringToNumber(stat?.bobbles),

					// Pitching
					battersFaced: convertStringToNumber(stat?.battersFaced),
					pitches: convertStringToNumber(stat?.pitches),
					strikes: convertStringToNumber(stat?.strikes),
					balls: convertStringToNumber(stat?.balls),
					beanBalls: convertStringToNumber(stat?.beanBalls),
					hitsAllowed: convertStringToNumber(stat?.hitsAllowed),
					singlesAllowed: convertStringToNumber(stat?.singlesAllowed),
					doublesAllowed: convertStringToNumber(stat?.doublesAllowed),
					triplesAllowed: convertStringToNumber(stat?.triplesAllowed),
					homeRunsAllowed: convertStringToNumber(
						stat?.homeRunsAllowed,
					),
					inheritedRuns: convertStringToNumber(stat?.inheritedRuns),
					starPitches: convertStringToNumber(stat?.starPitches),
					starsUsedPitching: convertStringToNumber(
						stat?.starsUsedPitching,
					),
					pickoffs: convertStringToNumber(stat?.pickoffs),
					pickoffAttempts: convertStringToNumber(
						stat?.pickoffAttempts,
					),
					obp: calculateOBP(
						convertStringToNumber(stat?.hits),
						convertStringToNumber(stat?.walksTaken),
						convertStringToNumber(stat?.hitByPitch),
						convertStringToNumber(stat?.atBats),
						convertStringToNumber(stat?.sacFlies),
					),
					slg: calculateSLG(
						convertStringToNumber(stat?.hits),
						convertStringToNumber(stat?.singles),
						convertStringToNumber(stat?.doubles),
						convertStringToNumber(stat?.triples),
						convertStringToNumber(stat?.homeRuns),
						convertStringToNumber(stat?.atBats),
					),
					ops: calculateOPS(
						calculateOBP(
							convertStringToNumber(stat?.hits),
							convertStringToNumber(stat?.walksTaken),
							convertStringToNumber(stat?.hitByPitch),
							convertStringToNumber(stat?.atBats),
							convertStringToNumber(stat?.sacFlies),
						),
						calculateSLG(
							convertStringToNumber(stat?.hits),
							convertStringToNumber(stat?.singles),
							convertStringToNumber(stat?.doubles),
							convertStringToNumber(stat?.triples),
							convertStringToNumber(stat?.homeRuns),
							convertStringToNumber(stat?.atBats),
						),
					),
					whip: calculateWHIP(
						convertStringToNumber(stat?.walks),
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.outsPitched),
					),
					baa: calculateBAA(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.battersFaced),
					),
					obpAgainst: calculateOBPAgainst(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.walks),
						convertStringToNumber(stat?.battersFaced),
					),
					slgAgainst: calculateSLGAgainst(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.singlesAllowed),
						convertStringToNumber(stat?.doublesAllowed),
						convertStringToNumber(stat?.triplesAllowed),
						convertStringToNumber(stat?.homeRunsAllowed),
						convertStringToNumber(stat?.battersFaced),
					),
					opsAgainst: calculateOPSAgainst(
						calculateOBPAgainst(
							convertStringToNumber(stat?.hitsAllowed),
							convertStringToNumber(stat?.walks),
							convertStringToNumber(stat?.battersFaced),
						),
						calculateSLGAgainst(
							convertStringToNumber(stat?.hitsAllowed),
							convertStringToNumber(stat?.singlesAllowed),
							convertStringToNumber(stat?.doublesAllowed),
							convertStringToNumber(stat?.triplesAllowed),
							convertStringToNumber(stat?.homeRunsAllowed),
							convertStringToNumber(stat?.battersFaced),
						),
					),
				},
			};
		},
	);

	return allPlayersWithStats;
}

export async function getAllFreeAgents() {
	const freeAgents = await findFreeAgents();

	const stats = await findAllPlayerStats();

	const freeAgentsWithStats: PlayerWithStatsDto[] = freeAgents.map(
		(player) => {
			const stat = stats.find((s) => s.playerId === player.id);
			return {
				id: player.id,
				name: player.name,
				image: player.image,
				isCaptain: player.isCaptain,
				playerCardImage: player.playerCardImage,
				teamId: player.teamId,
				team: null,
				batting: player.batting,
				pitching: player.pitching,
				running: player.running,
				fielding: player.fielding,
				starSwing: player.starSwing,
				starPitch: player.starPitch,
				fieldingAbility: player.fieldingAbility,
				position: null,
				stats: {
					atBats: Number(stat?.atBats) || 0,
					hits: Number(stat?.hits) || 0,
					runs: Number(stat?.runs) || 0,
					rbis: Number(stat?.rbis) || 0,
					walks: Number(stat?.walks) || 0,
					strikeouts: Number(stat?.strikeouts) || 0,
					homeRuns: Number(stat?.homeRuns) || 0,
					inningsPitched: calculateInningsPitched(
						Number(stat?.outsPitched) || 0,
					),
					runsAllowed: Number(stat?.runsAllowed) || 0,
					outs: Number(stat?.outs) || 0,
					battingAverage:
						Number(stat?.hits) / Number(stat?.atBats) || 0,
					era: calculateEra(
						Number(stat?.runsAllowed) || 0,
						Number(stat?.outsPitched) || 0,
					),
					gamesPlayed: stat?.gamesPlayed || 0,

					// Batting
					outsPitched: Number(stat?.outsPitched) || 0,
					plateAppearances: convertStringToNumber(
						stat?.plateAppearances,
					),
					strikeoutsBatted: convertStringToNumber(
						stat?.strikeoutsBatted,
					),
					walksTaken: convertStringToNumber(stat?.walksTaken),
					hitByPitch: convertStringToNumber(stat?.hitByPitch),
					singles: convertStringToNumber(stat?.singles),
					doubles: convertStringToNumber(stat?.doubles),
					triples: convertStringToNumber(stat?.triples),
					oneHr: convertStringToNumber(stat?.oneHr),
					twoHr: convertStringToNumber(stat?.twoHr),
					threeHr: convertStringToNumber(stat?.threeHr),
					grandSlams: convertStringToNumber(stat?.grandSlams),
					totalBases: convertStringToNumber(stat?.totalBases),
					sacFlies: convertStringToNumber(stat?.sacFlies),
					startHits: convertStringToNumber(stat?.startHits),
					starsUsedBatting: convertStringToNumber(
						stat?.starsUsedBatting,
					),

					// Baserunning
					stolenBases: convertStringToNumber(stat?.stolenBases),
					caughtStealing: convertStringToNumber(stat?.caughtStealing),
					stealAttempts: convertStringToNumber(stat?.stealAttempts),

					// Fielding
					putout: convertStringToNumber(stat?.putout),
					assist: convertStringToNumber(stat?.assist),
					fieldingErrors: convertStringToNumber(stat?.fieldingErrors),
					buddyJumpPutouts: convertStringToNumber(
						stat?.buddyJumpPutouts,
					),
					buddyJumpAttempts: convertStringToNumber(
						stat?.buddyJumpAttempts,
					),
					doublePlays: convertStringToNumber(stat?.doublePlays),
					triplePlays: convertStringToNumber(stat?.triplePlays),
					bobbles: convertStringToNumber(stat?.bobbles),

					// Pitching
					battersFaced: convertStringToNumber(stat?.battersFaced),
					pitches: convertStringToNumber(stat?.pitches),
					strikes: convertStringToNumber(stat?.strikes),
					balls: convertStringToNumber(stat?.balls),
					beanBalls: convertStringToNumber(stat?.beanBalls),
					hitsAllowed: convertStringToNumber(stat?.hitsAllowed),
					singlesAllowed: convertStringToNumber(stat?.singlesAllowed),
					doublesAllowed: convertStringToNumber(stat?.doublesAllowed),
					triplesAllowed: convertStringToNumber(stat?.triplesAllowed),
					homeRunsAllowed: convertStringToNumber(
						stat?.homeRunsAllowed,
					),
					inheritedRuns: convertStringToNumber(stat?.inheritedRuns),
					starPitches: convertStringToNumber(stat?.starPitches),
					starsUsedPitching: convertStringToNumber(
						stat?.starsUsedPitching,
					),
					pickoffs: convertStringToNumber(stat?.pickoffs),
					pickoffAttempts: convertStringToNumber(
						stat?.pickoffAttempts,
					),
					obp: calculateOBP(
						convertStringToNumber(stat?.hits),
						convertStringToNumber(stat?.walksTaken),
						convertStringToNumber(stat?.hitByPitch),
						convertStringToNumber(stat?.atBats),
						convertStringToNumber(stat?.sacFlies),
					),
					slg: calculateSLG(
						convertStringToNumber(stat?.hits),
						convertStringToNumber(stat?.singles),
						convertStringToNumber(stat?.doubles),
						convertStringToNumber(stat?.triples),
						convertStringToNumber(stat?.homeRuns),
						convertStringToNumber(stat?.atBats),
					),
					ops: calculateOPS(
						calculateOBP(
							convertStringToNumber(stat?.hits),
							convertStringToNumber(stat?.walksTaken),
							convertStringToNumber(stat?.hitByPitch),
							convertStringToNumber(stat?.atBats),
							convertStringToNumber(stat?.sacFlies),
						),
						calculateSLG(
							convertStringToNumber(stat?.hits),
							convertStringToNumber(stat?.singles),
							convertStringToNumber(stat?.doubles),
							convertStringToNumber(stat?.triples),
							convertStringToNumber(stat?.homeRuns),
							convertStringToNumber(stat?.atBats),
						),
					),
					whip: calculateWHIP(
						convertStringToNumber(stat?.walks),
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.outsPitched),
					),
					baa: calculateBAA(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.battersFaced),
					),
					obpAgainst: calculateOBPAgainst(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.walks),
						convertStringToNumber(stat?.battersFaced),
					),
					slgAgainst: calculateSLGAgainst(
						convertStringToNumber(stat?.hitsAllowed),
						convertStringToNumber(stat?.singlesAllowed),
						convertStringToNumber(stat?.doublesAllowed),
						convertStringToNumber(stat?.triplesAllowed),
						convertStringToNumber(stat?.homeRunsAllowed),
						convertStringToNumber(stat?.battersFaced),
					),
					opsAgainst: calculateOPSAgainst(
						calculateOBPAgainst(
							convertStringToNumber(stat?.hitsAllowed),
							convertStringToNumber(stat?.walks),
							convertStringToNumber(stat?.battersFaced),
						),
						calculateSLGAgainst(
							convertStringToNumber(stat?.hitsAllowed),
							convertStringToNumber(stat?.singlesAllowed),
							convertStringToNumber(stat?.doublesAllowed),
							convertStringToNumber(stat?.triplesAllowed),
							convertStringToNumber(stat?.homeRunsAllowed),
							convertStringToNumber(stat?.battersFaced),
						),
					),
				},
			};
		},
	);

	return freeAgentsWithStats;
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

			// Batting
			homeRuns: Number(stat.homeRuns),
			atBats: Number(stat.atBats),
			hits: Number(stat.hits),
			runs: Number(stat.runs),
			rbis: Number(stat.RBIs),
			walks: Number(stat.walks),
			strikeouts: Number(stat.strikeouts),
			plateAppearances: convertStringToNumber(stat.plateAppearances),
			strikeoutsBatted: convertStringToNumber(stat.strikeoutsBatted),
			walksTaken: convertStringToNumber(stat.walksTaken),
			hitByPitch: convertStringToNumber(stat.hitByPitch),
			singles: convertStringToNumber(stat.singles),
			doubles: convertStringToNumber(stat.doubles),
			triples: convertStringToNumber(stat.triples),
			oneHr: convertStringToNumber(stat.oneHr),
			twoHr: convertStringToNumber(stat.twoHr),
			threeHr: convertStringToNumber(stat.threeHr),
			grandSlams: convertStringToNumber(stat.grandSlams),
			totalBases: convertStringToNumber(stat.totalBases),
			sacFlies: convertStringToNumber(stat.sacFlies),
			startHits: convertStringToNumber(stat.startHits),
			starsUsedBatting: convertStringToNumber(stat.starsUsedBatting),

			// Baserunning
			stolenBases: convertStringToNumber(stat.stolenBases),
			caughtStealing: convertStringToNumber(stat.caughtStealing),
			stealAttempts: convertStringToNumber(stat.stealAttempts),

			// Fielding
			putout: convertStringToNumber(stat.putout),
			assist: convertStringToNumber(stat.assist),
			fieldingErrors: convertStringToNumber(stat.fieldingErrors),
			buddyJumpPutouts: convertStringToNumber(stat.buddyJumpPutouts),
			buddyJumpAttempts: convertStringToNumber(stat.buddyJumpAttempts),
			doublePlays: convertStringToNumber(stat.doublePlays),
			triplePlays: convertStringToNumber(stat.triplePlays),
			bobbles: convertStringToNumber(stat.bobbles),

			// Pitching
			outsPitched: Number(stat.outsPitched),
			inningsPitched: calculateInningsPitched(stat.outsPitched),
			runsAllowed: Number(stat.runsAllowed),
			outs: Number(stat.outs),
			battersFaced: convertStringToNumber(stat.battersFaced),
			pitches: convertStringToNumber(stat.pitches),
			strikes: convertStringToNumber(stat.strikes),
			balls: convertStringToNumber(stat.balls),
			beanBalls: convertStringToNumber(stat.beanBalls),
			hitsAllowed: convertStringToNumber(stat.hitsAllowed),
			singlesAllowed: convertStringToNumber(stat.singlesAllowed),
			doublesAllowed: convertStringToNumber(stat.doublesAllowed),
			triplesAllowed: convertStringToNumber(stat.triplesAllowed),
			homeRunsAllowed: convertStringToNumber(stat.homeRunsAllowed),
			inheritedRuns: convertStringToNumber(stat.inheritedRuns),
			starPitches: convertStringToNumber(stat.starPitches),
			starsUsedPitching: convertStringToNumber(stat.starsUsedPitching),
			pickoffs: convertStringToNumber(stat.pickoffs),
			pickoffAttempts: convertStringToNumber(stat.pickoffAttempts),

			// Derived stats
			battingAverage: stat.hits / stat.atBats,
			era: calculateEra(stat.runsAllowed, stat.outsPitched),

			// Teams
			teamsPlayedFor: stat.teamsPlayedFor,
			obp: calculateOBP(
				stat.hits,
				convertStringToNumber(stat?.walksTaken),
				convertStringToNumber(stat?.hitByPitch),
				stat.atBats,
				convertStringToNumber(stat?.sacFlies),
			),
			slg: calculateSLG(
				stat.hits,
				convertStringToNumber(stat?.singles),
				convertStringToNumber(stat?.doubles),
				convertStringToNumber(stat?.triples),
				stat.homeRuns,
				stat.atBats,
			),
			ops: calculateOPS(
				calculateOBP(
					stat.hits,
					convertStringToNumber(stat?.walksTaken),
					convertStringToNumber(stat?.hitByPitch),
					stat.atBats,
					convertStringToNumber(stat?.sacFlies),
				),
				calculateSLG(
					stat.hits,
					convertStringToNumber(stat?.singles),
					convertStringToNumber(stat?.doubles),
					convertStringToNumber(stat?.triples),
					stat.homeRuns,
					stat.atBats,
				),
			),
			whip: calculateWHIP(
				stat.walks,
				convertStringToNumber(stat?.hitsAllowed),
				stat.outsPitched,
			),
			baa: calculateBAA(
				convertStringToNumber(stat?.hitsAllowed),
				convertStringToNumber(stat?.battersFaced),
			),
			obpAgainst: calculateOBPAgainst(
				convertStringToNumber(stat?.hitsAllowed),
				stat.walks,
				convertStringToNumber(stat?.battersFaced),
			),
			slgAgainst: calculateSLGAgainst(
				convertStringToNumber(stat?.hitsAllowed),
				convertStringToNumber(stat?.singlesAllowed),
				convertStringToNumber(stat?.doublesAllowed),
				convertStringToNumber(stat?.triplesAllowed),
				convertStringToNumber(stat?.homeRunsAllowed),
				convertStringToNumber(stat?.battersFaced),
			),
			opsAgainst: calculateOPSAgainst(
				calculateOBPAgainst(
					convertStringToNumber(stat?.hitsAllowed),
					stat.walks,
					convertStringToNumber(stat?.battersFaced),
				),
				calculateSLGAgainst(
					convertStringToNumber(stat?.hitsAllowed),
					convertStringToNumber(stat?.singlesAllowed),
					convertStringToNumber(stat?.doublesAllowed),
					convertStringToNumber(stat?.triplesAllowed),
					convertStringToNumber(stat?.homeRunsAllowed),
					convertStringToNumber(stat?.battersFaced),
				),
			),
		})),
	};

	return playerCareerStats;
}

export async function getPlayerAwards(playerId: string) {
	const awards = await findPlayerAwards(playerId);

	const groupedAwards = Object.values(
		awards.reduce(
			(acc, curr) => {
				const { award, season, awardedAt } = curr;

				if (!acc[award.id]) {
					acc[award.id] = {
						awardId: award.id,
						name: award.name,
						description: award.description,
						category: award.category,
						icon: award.icon,
						wins: [],
					};
				}

				acc[award.id].wins.push({
					seasonId: season.id,
					awardedAt,
					seasonStart: season.startDate,
					seasonEnd: season.endDate,
					currentWeek: season.currentWeek,
				});

				return acc;
			},
			{} as Record<string, PlayerAward>,
		),
	);

	return groupedAwards;
}
