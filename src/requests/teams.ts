import {
	TeamRosterDto,
	TeamResponseDto,
	TeamWithKeepsDto,
} from "@/dtos/teamDtos";

export async function getAllTeams() {
	const response = await fetch("http://localhost:3000/api/teams", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch teams");
	}

	const data: TeamResponseDto = await response.json();

	return data;
}

export async function getTeamRoster(teamId: string) {
	const response = await fetch(
		`http://localhost:3000/api/teams/${teamId}/roster`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch roster");
	}

	const data: TeamRosterDto = await response.json();

	return data;
}

export async function getTeambyId(teamId: string) {
	const response = await fetch(`http://localhost:3000/api/teams/${teamId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch team");
	}

	const data: TeamWithKeepsDto = await response.json();

	return data;
}

export async function getUserTeamById(token: string) {
	const response = await fetch(`http://localhost:3000/api/users/teams`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch team");
	}

	const data: TeamWithKeepsDto = await response.json();

	return data;
}

export async function getUserTeamRoster(token: string) {
	const response = await fetch(
		`http://localhost:3000/api/users/teams/roster`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch roster");
	}

	const data: TeamRosterDto = await response.json();

	return data;
}
