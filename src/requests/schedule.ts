import { GameResponseDto, SeasonScheduleResponseDto } from "@/dtos/gameDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSeasonSchedule(season: string) {
	const response = await fetch(`${API_URL}/api/seasons/${season}/schedule`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch schedule");
	}

	const data: SeasonScheduleResponseDto = await response.json();

	return data;
}

export async function getWeeklySchedule(week: string | null, season: string) {
	const weekQuery = week ? `week=${week}` : "";

	const response = await fetch(
		`${API_URL}/api/seasons/${season}/games?${weekQuery}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch schedule");
	}

	const data: GameResponseDto = await response.json();

	return data;
}

export async function getTeamSchedule(teamId: string) {
	const response = await fetch(`${API_URL}/api/teams/${teamId}/schedule`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch schedule");
	}

	const data: GameResponseDto = await response.json();

	return data;
}

export async function getMyTeamSchedule(token: string) {
	const response = await fetch(`${API_URL}/api/users/teams/schedule`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch schedule");
	}

	const data: GameResponseDto = await response.json();

	return data;
}

import { TeamPairOddsDto } from "@/dtos/gameDtos";

/** Compute win odds for a hypothetical matchup between two teams this season. */
export async function getTeamPairOdds(
	season: string,
	teamAId: string,
	teamBId: string,
) {
	const response = await fetch(
		`${API_URL}/api/seasons/${season}/odds?teamA=${teamAId}&teamB=${teamBId}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error ?? "Failed to compute odds");
	}

	const data: TeamPairOddsDto = await response.json();

	return data;
}
