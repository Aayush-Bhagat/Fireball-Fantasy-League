import { calculateEra, calculateInningsPitched } from "@/lib/statUtils";
import {
	findAllTeamRecordsBySeason,
	findAllTeams,
	findRosterStatsByTeam,
	findTeamById,
	findTeamByUserId,
	findTeamIdByUserId,
} from "@/repositories/teamRepository";
import { TeamDto, TeamStandingsDto, TeamWithKeepsDto } from "@/dtos/teamDtos";
import { findPlayersByTeam } from "@/repositories/playerRepository";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { GameDtoMapper } from "@/lib/mappers/gameMappers";
import { findTeamSchedule } from "@/repositories/gameRepository";

export async function getAllTeams() {
	const teams = await findAllTeams();

	if (!teams) {
		throw new Error("No teams found");
	}

	const teamDtos: TeamDto[] = teams.map((team) => ({
		id: team.id,
		name: team.name,
		logo: team.logo,
		abbreviation: team.abbreviation,
		conference: team.conference.name,
		userId: team.userId,
	}));

	return teamDtos;
}

export async function getStandings(season: string) {
	if (season !== "current" && isNaN(Number(season))) {
		throw new Error("Invalid season");
	}

	const seasonId = season === "current" ? null : parseInt(season);

	const standings = await findAllTeamRecordsBySeason(seasonId);

	const easternStandings = standings.filter(
		(standing) => standing.conferenceName === "Eastern"
	);

	const westernStandings = standings.filter(
		(standing) => standing.conferenceName === "Western"
	);

	const easternStandingsSorted = easternStandings.sort((a, b) => {
		return Number(b.wins) - Number(a.wins);
	});

	const westernStandingsSorted = westernStandings.sort((a, b) => {
		return Number(b.wins) - Number(a.wins);
	});

	const easternStandingsDto: TeamStandingsDto[] = easternStandingsSorted.map(
		(standing) => ({
			id: standing.teamId,
			name: standing.teamName,
			abbreviation: standing.teamAbbreviation,
			logo: standing.teamLogo,
			conference: standing.conferenceName,
			wins: Number(standing.wins),
			losses: Number(standing.losses),
			season: Number(standing.season),
		})
	);

	const westernStandingsDto: TeamStandingsDto[] = westernStandingsSorted.map(
		(standing) => ({
			id: standing.teamId,
			name: standing.teamName,
			abbreviation: standing.teamAbbreviation,
			logo: standing.teamLogo,
			conference: standing.conferenceName,
			wins: Number(standing.wins),
			losses: Number(standing.losses),
			season: Number(standing.season),
		})
	);

	return { eastern: easternStandingsDto, western: westernStandingsDto };
}

export async function getTeamById(id: string) {
	const team = await findTeamById(id);

	if (!team) {
		throw new Error("Team not found");
	}

	const teamDto: TeamWithKeepsDto = {
		team: {
			id: team.id,
			name: team.name,
			logo: team.logo,
			abbreviation: team.abbreviation,
			conference: team.conference.name,
			userId: team.userId,
		},
		keeps: team.keeps,
	};

	return teamDto;
}

export async function getTeamRoster(teamId: string) {
	const roster = await findPlayersByTeam(teamId);

	const teamRosterStats = await findRosterStatsByTeam(teamId);

	const fullRosterWithStats: PlayerWithStatsDto[] = roster.map((player) => {
		const stat = teamRosterStats.find((s) => s.playerId === player.id);
		return {
			id: player.id,
			name: player.name,
			image: player.image,
			isCaptain: player.isCaptain,
			team: player.team
				? {
						id: player.team.id,
						name: player.team.name,
						logo: player.team.logo,
						abbreviation: player.team.abbreviation,
						conference: player.team.conference.name,
						userId: player.team?.userId,
				  }
				: null,
			batting: player.batting,
			pitching: player.pitching,
			running: player.running,
			fielding: player.fielding,
			starSwing: player.starSwing,
			starPitch: player.starPitch,
			fieldingAbility: player.fieldingAbility,
			playerCardImage: player.playerCardImage,
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
				battingAverage: Number(stat?.hits) / Number(stat?.atBats) || 0,
				era: calculateEra(
					Number(stat?.runsAllowed) || 0,
					Number(stat?.outsPitched) || 0
				),
			},
		};
	});

	return fullRosterWithStats;
}

export async function getUserTeam(userId: string) {
	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	const teamDto: TeamWithKeepsDto = {
		team: {
			id: team.id,
			name: team.name,
			logo: team.logo,
			abbreviation: team.abbreviation,
			conference: team.conference.name,
			userId: team.userId,
		},
		keeps: team.keeps,
	};

	return teamDto;
}

export async function getUserTeamRoster(userId: string) {
	const teamId = await findTeamIdByUserId(userId);

	const roster = await getTeamRoster(teamId);

	return roster;
}

export async function getTeamSchedule(teamId: string, season: string | null) {
	if (season !== "current" && isNaN(Number(season))) {
		throw new Error("Invalid season");
	}

	const seasonId = season === "current" || !season ? null : parseInt(season);

	const games = await findTeamSchedule(teamId, seasonId);

	const records = await findAllTeamRecordsBySeason(seasonId);

	const teamSchedule = GameDtoMapper(games, records);

	return teamSchedule;
}
