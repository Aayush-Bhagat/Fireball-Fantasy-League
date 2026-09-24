import { db } from "@/db";
import {
	eq,
	sql,
	sum,
	and,
	countDistinct,
	isNull,
	inArray,
	or,
} from "drizzle-orm";
import { players, playerHistory, playerGamesStats } from "@/models/players";
import { games } from "@/models/games";
import { seasonAwards, seasons } from "@/models/seasons";
import { teamLineups, teams } from "@/models/teams";
import { TeamLineupPosition } from "@/dtos/teamDtos";
import {
	StatTrackerBattingStatsPlayer,
	StatTrackerPitchingStatsPlayer,
} from "@/dtos/statTrackerDtos";

export async function findPlayersByTeam(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
			teamLineups: true,
		},
		where: eq(players.teamId, teamId),
	});

	return teamPlayers;
}

export async function findPlayerHistoryByPlayer(playerId: string) {
	const history = await db.query.playerHistory.findMany({
		where: eq(playerHistory.playerId, playerId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return history;
}

export async function findAllPlayers() {
	const allPlayers = await db.query.players.findMany({
		with: {
			team: { with: { conference: { columns: { name: true } } } },
			teamLineups: true,
		},
	});

	return allPlayers;
}

export async function findFreeAgents() {
	const freeAgents = await db.query.players.findMany({
		where: eq(isNull(players.teamId), true),
	});

	return freeAgents;
}

export async function findAllPlayerStats(season?: string) {
	const seasonQuery = db
		.select({
			id: seasons.id,
		})
		.from(seasons)
		.where(eq(seasons.status, "in_progress"));

	const stats = await db
		.select({
			playerId: players.id,
			name: players.name,

			atBats: sum(playerGamesStats.atBats).as("atBats"),
			hits: sum(playerGamesStats.hits).as("hits"),
			runs: sum(playerGamesStats.runs).as("runs"),
			rbis: sum(playerGamesStats.rbis).as("rbis"),
			walks: sum(playerGamesStats.walks).as("walks"),
			strikeouts: sum(playerGamesStats.strikeouts).as("strikeouts"),
			homeRuns: sum(playerGamesStats.homeRuns).as("homeRuns"),
			outsPitched: sum(playerGamesStats.outsPitched).as("outsPitched"),
			runsAllowed: sum(playerGamesStats.runsAllowed).as("runsAllowed"),
			outs: sum(playerGamesStats.outs).as("outs"),
			plateAppearances: sum(playerGamesStats.plateAppearances).as(
				"plateAppearances",
			),
			strikeoutsBatted: sum(playerGamesStats.strikeoutsBatted).as(
				"strikeoutsBatted",
			),
			walksTaken: sum(playerGamesStats.walksTaken).as("walksTaken"),
			hitByPitch: sum(playerGamesStats.hitByPitch).as("hitByPitch"),
			singles: sum(playerGamesStats.singles).as("singles"),
			doubles: sum(playerGamesStats.doubles).as("doubles"),
			triples: sum(playerGamesStats.triples).as("triples"),
			oneHr: sum(playerGamesStats.oneHr).as("oneHr"),
			twoHr: sum(playerGamesStats.twoHr).as("twoHr"),
			threeHr: sum(playerGamesStats.threeHr).as("threeHr"),
			grandSlams: sum(playerGamesStats.grandSlams).as("grandSlams"),
			totalBases: sum(playerGamesStats.totalBases).as("totalBases"),
			sacFlies: sum(playerGamesStats.sacFlies).as("sacFlies"),
			startHits: sum(playerGamesStats.startHits).as("startHits"),
			starsUsedBatting: sum(playerGamesStats.starsUsedBatting).as(
				"starsUsedBatting",
			),
			stolenBases: sum(playerGamesStats.stolenBases).as("stolenBases"),
			caughtStealing: sum(playerGamesStats.caughtStealing).as(
				"caughtStealing",
			),
			stealAttempts: sum(playerGamesStats.stealAttempts).as(
				"stealAttempts",
			),
			assist: sum(playerGamesStats.assist).as("assist"),
			buddyJumpPutouts: sum(playerGamesStats.buddyJumpPutouts).as(
				"buddyJumpPutouts",
			),
			buddyJumpAttempts: sum(playerGamesStats.buddyJumpAttempts).as(
				"buddyJumpAttempts",
			),
			doublePlays: sum(playerGamesStats.doublePlays).as("doublePlays"),
			triplePlays: sum(playerGamesStats.triplePlays).as("triplePlays"),
			bobbles: sum(playerGamesStats.bobbles).as("bobbles"),

			battersFaced: sum(playerGamesStats.battersFaced).as("battersFaced"),
			pitches: sum(playerGamesStats.pitches).as("pitches"),
			strikes: sum(playerGamesStats.strikes).as("strikes"),
			balls: sum(playerGamesStats.balls).as("balls"),
			beanBalls: sum(playerGamesStats.beanBalls).as("beanBalls"),
			hitsAllowed: sum(playerGamesStats.hitsAllowed).as("hitsAllowed"),
			singlesAllowed: sum(playerGamesStats.singlesAllowed).as(
				"singlesAllowed",
			),
			doublesAllowed: sum(playerGamesStats.doublesAllowed).as(
				"doublesAllowed",
			),
			triplesAllowed: sum(playerGamesStats.triplesAllowed).as(
				"triplesAllowed",
			),
			homeRunsAllowed: sum(playerGamesStats.homeRunsAllowed).as(
				"homeRunsAllowed",
			),
			inheritedRuns: sum(playerGamesStats.inheritedRuns).as(
				"inheritedRuns",
			),
			starPitches: sum(playerGamesStats.starPitches).as("starPitches"),
			starsUsedPitching: sum(playerGamesStats.starsUsedPitching).as(
				"starsUsedPitching",
			),
			pickoffs: sum(playerGamesStats.pickoffs).as("pickoffs"),
			pickoffAttempts: sum(playerGamesStats.pickoffAttempts).as(
				"pickoffAttempts",
			),

			gamesPlayed: countDistinct(playerGamesStats.gameId).as(
				"gamesPlayed",
			),
		})
		.from(players)
		.leftJoin(playerGamesStats, eq(players.id, playerGamesStats.playerId))
		.leftJoin(games, eq(playerGamesStats.gameId, games.id))
		.where(eq(games.seasonId, season ? Number(season) : seasonQuery))
		.groupBy(players.id);

	return stats;
}

export async function findPlayerInfo(playerId: string) {
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return player;
}

export async function findPlayerCareerStats(playerId: string) {
	const stats = await db
		.select({
			seasonId: seasons.id,
			playerId: players.id,
			playerName: players.name,

			// Batting
			atBats: sql<number>`coalesce(sum(${playerGamesStats.atBats}), 0)`,
			hits: sql<number>`coalesce(sum(${playerGamesStats.hits}), 0)`,
			runs: sql<number>`coalesce(sum(${playerGamesStats.runs}), 0)`,
			RBIs: sql<number>`coalesce(sum(${playerGamesStats.rbis}), 0)`,
			walks: sql<number>`coalesce(sum(${playerGamesStats.walks}), 0)`,
			strikeouts: sql<number>`coalesce(sum(${playerGamesStats.strikeouts}), 0)`,
			homeRuns: sql<number>`coalesce(sum(${playerGamesStats.homeRuns}), 0) `,
			plateAppearances: sum(playerGamesStats.plateAppearances).as(
				"plateAppearances",
			),
			strikeoutsBatted: sum(playerGamesStats.strikeoutsBatted).as(
				"strikeoutsBatted",
			),
			walksTaken: sum(playerGamesStats.walksTaken).as("walksTaken"),
			hitByPitch: sum(playerGamesStats.hitByPitch).as("hitByPitch"),
			singles: sum(playerGamesStats.singles).as("singles"),
			doubles: sum(playerGamesStats.doubles).as("doubles"),
			triples: sum(playerGamesStats.triples).as("triples"),
			oneHr: sum(playerGamesStats.oneHr).as("oneHr"),
			twoHr: sum(playerGamesStats.twoHr).as("twoHr"),
			threeHr: sum(playerGamesStats.threeHr).as("threeHr"),
			grandSlams: sum(playerGamesStats.grandSlams).as("grandSlams"),
			totalBases: sum(playerGamesStats.totalBases).as("totalBases"),
			sacFlies: sum(playerGamesStats.sacFlies).as("sacFlies"),
			startHits: sum(playerGamesStats.startHits).as("startHits"),
			starsUsedBatting: sum(playerGamesStats.starsUsedBatting).as(
				"starsUsedBatting",
			),

			// Baserunning
			stolenBases: sum(playerGamesStats.stolenBases).as("stolenBases"),
			caughtStealing: sum(playerGamesStats.caughtStealing).as(
				"caughtStealing",
			),
			stealAttempts: sum(playerGamesStats.stealAttempts).as(
				"stealAttempts",
			),

			// Fielding
			assist: sum(playerGamesStats.assist).as("assist"),
			buddyJumpPutouts: sum(playerGamesStats.buddyJumpPutouts).as(
				"buddyJumpPutouts",
			),
			buddyJumpAttempts: sum(playerGamesStats.buddyJumpAttempts).as(
				"buddyJumpAttempts",
			),
			doublePlays: sum(playerGamesStats.doublePlays).as("doublePlays"),
			triplePlays: sum(playerGamesStats.triplePlays).as("triplePlays"),
			bobbles: sum(playerGamesStats.bobbles).as("bobbles"),

			// Pitching
			outsPitched: sql<number>`coalesce(sum(${playerGamesStats.outsPitched}), 0)`,
			runsAllowed: sql<number>`coalesce(sum(${playerGamesStats.runsAllowed}), 0)`,
			outs: sql<number>`coalesce(sum(${playerGamesStats.outs}), 0)`,
			battersFaced: sum(playerGamesStats.battersFaced).as("battersFaced"),
			pitches: sum(playerGamesStats.pitches).as("pitches"),
			strikes: sum(playerGamesStats.strikes).as("strikes"),
			balls: sum(playerGamesStats.balls).as("balls"),
			beanBalls: sum(playerGamesStats.beanBalls).as("beanBalls"),
			hitsAllowed: sum(playerGamesStats.hitsAllowed).as("hitsAllowed"),
			singlesAllowed: sum(playerGamesStats.singlesAllowed).as(
				"singlesAllowed",
			),
			doublesAllowed: sum(playerGamesStats.doublesAllowed).as(
				"doublesAllowed",
			),
			triplesAllowed: sum(playerGamesStats.triplesAllowed).as(
				"triplesAllowed",
			),
			homeRunsAllowed: sum(playerGamesStats.homeRunsAllowed).as(
				"homeRunsAllowed",
			),
			inheritedRuns: sum(playerGamesStats.inheritedRuns).as(
				"inheritedRuns",
			),
			starPitches: sum(playerGamesStats.starPitches).as("starPitches"),
			starsUsedPitching: sum(playerGamesStats.starsUsedPitching).as(
				"starsUsedPitching",
			),
			pickoffs: sum(playerGamesStats.pickoffs).as("pickoffs"),
			pickoffAttempts: sum(playerGamesStats.pickoffAttempts).as(
				"pickoffAttempts",
			),

			// Teams
			teamsPlayedFor: sql<
				string[] | null
			>`ARRAY_AGG(DISTINCT ${teams.abbreviation}) FILTER (WHERE ${teams.id} IS NOT NULL)`.as(
				"teams_played_for",
			),
		})
		.from(seasons)
		.crossJoin(players)
		.leftJoin(games, eq(games.seasonId, seasons.id))
		.leftJoin(
			playerGamesStats,
			and(
				eq(playerGamesStats.gameId, games.id),
				eq(playerGamesStats.playerId, players.id),
			),
		)
		.leftJoin(teams, eq(teams.id, playerGamesStats.teamId))
		.where(eq(players.id, playerId))
		.groupBy(seasons.id, players.id, players.name)
		.orderBy(seasons.id);

	return stats;
}

export async function findPlayersByTeamId(teamId: string) {
	const teamPlayers = await db.query.players.findMany({
		where: eq(players.teamId, teamId),
		with: {
			team: { with: { conference: { columns: { name: true } } } },
		},
	});

	return teamPlayers;
}

export async function findPlayerPosition(playerId: string) {
	const player = await db.query.players.findFirst({
		where: eq(players.id, playerId),
		with: {
			teamLineups: true,
		},
	});

	if (!player || !player.teamLineups) {
		return null;
	}

	return player.teamLineups;
}

export async function updatePlayerTeam(playerId: string, newTeamId: string) {
	const updatedPlayer = await db
		.update(players)
		.set({ teamId: newTeamId })
		.where(eq(players.id, playerId))
		.returning();

	if (updatedPlayer.length === 0) {
		throw new Error("Player not found or update failed");
	}

	return updatedPlayer[0];
}

export async function updatePlayerPosition(
	playerId: string,
	newPosition: TeamLineupPosition | null,
) {
	const updatedPlayer = await db
		.update(teamLineups)
		.set({ fieldingPosition: newPosition })
		.where(eq(teamLineups.playerId, playerId))
		.returning();

	if (updatedPlayer.length === 0) {
		throw new Error("Player not found or update failed");
	}

	return updatedPlayer[0];
}

export async function savePlayerHistory(
	id: string,
	playerId: string,
	teamId: string,
	type: "Trade" | "Draft",
	tradeId: string | null = null,
	draftRound: number | null = null,
	draftPick: number | null = null,
	season: number | undefined = undefined,
	draftPickId: string | null = null,
) {
	let seasonId = season;

	console.log(seasonId);

	if (!seasonId) {
		const seasonQuery = await db
			.select({
				id: seasons.id,
			})
			.from(seasons)
			.where(eq(seasons.status, "in_progress"));

		seasonId = seasonQuery[0].id;
	}

	const playerHistoryEntry = await db
		.insert(playerHistory)
		.values({
			id: id,
			playerId,
			teamId,
			seasonId,
			type,
			tradeId,
			draftRound,
			draftPick,
			draftPickId,
		})
		.returning();

	if (playerHistoryEntry.length === 0) {
		throw new Error("Failed to save player history");
	}

	return playerHistoryEntry[0];
}

export function findPlayerAwards(playerId: string) {
	return db.query.seasonAwards.findMany({
		where: eq(seasonAwards.playerId, playerId),
		with: {
			season: true,
			award: true,
		},
	});
}

export async function findPlayersByName(
	names: string[],
	miiId: string | null = null,
) {
	const conditions = [inArray(players.name, names)];

	if (miiId) {
		conditions.push(eq(players.id, miiId));
	}

	return await db.query.players.findMany({
		where: or(...conditions),
		with: {
			teamLineups: true,
		},
	});
}

export async function createPlayerGameStats(
	gameId: string,
	players: StatTrackerBattingStatsPlayer[],
) {
	const stats = players.map((player) => ({
		gameId,
		playerId: player.playerId,
		teamId: player.teamId,

		// Batting
		atBats: player["At-Bats"],
		hits: player.Hits,
		runs: player.Runs,
		rbis: player.RBI,
		walksTaken: player.Walks,
		strikeoutsBatted: player.Strikeouts,
		homeRuns: player["Home Runs"],

		plateAppearances: player["Plate Appearances"],
		hitByPitch: player["Hit By Pitch"],
		singles: player.Singles,
		doubles: player.Doubles,
		triples: player.Triples,
		oneHr: player["1HR"],
		twoHr: player["2HR"],
		threeHr: player["3HR"],
		grandSlams: player["Grand Slams"],
		totalBases: player["Total Bases"],
		sacFlies: player["Sac Flys"],
		startHits: player["Star Hits"],
		starsUsedBatting: player["Stars Used"],
		stolenBases: player["Stolen Bases"],
		caughtStealing: player["Caught Stealing"],
		stealAttempts: player["Steal Attempts"],
		putout: player.Putouts,
		assist: player.Assists,
		buddyJumpPutouts: player["Buddy Jump Putouts"],
		buddyJumpAttempts: player["Buddy Jump Attempts"],
		doublePlays: player["Double Plays"],
		triplePlays: player["Triple Plays"],
		bobbles: player.Bobbles,
		outs: player.Putouts,

		// Pitching stats — not present in batting import
		walks: 0,
		outsPitched: 0,
		runsAllowed: 0,
		strikeouts: 0,
		position: player.position,
		battingOrder: player.battingOrder,
	}));

	if (stats.length === 0) {
		return [];
	}

	return await db.insert(playerGamesStats).values(stats).returning();
}

export async function updatePlayerGamePitchingStats(
	gameId: string,
	players: StatTrackerPitchingStatsPlayer[],
) {
	await db.transaction(async (tx) => {
		for (const player of players) {
			await tx
				.update(playerGamesStats)
				.set({
					outsPitched: Math.round(player["Innings Pitched"] * 3),
					runsAllowed: player["Runs Allowed"],
					walks: player.Walks,
					battersFaced: player["Batters Faced"],
					pitches: player.Pitches,
					strikes: player.Strikes,
					strikeouts: player.Strikeouts,
					balls: player.Balls,
					beanBalls: player["Bean Balls"],
					hitsAllowed: player["Hits Allowed"],
					singlesAllowed: player["Singles Allowed"],
					doublesAllowed: player["Doubles Allowed"],
					triplesAllowed: player["Triples Allowed"],
					homeRunsAllowed: player["HR Allowed"],
					inheritedRuns: player["Inherited Runs"],
					starPitches: player["Star Pitches"],
					starsUsedPitching: player["Stars Used"],
					pickoffs: player.Pickoffs,
					pickoffAttempts: player["Pickoff Attempts"],
				})
				.where(
					and(
						eq(playerGamesStats.gameId, gameId),
						eq(playerGamesStats.playerId, player.playerId),
					),
				);
		}
	});
}
