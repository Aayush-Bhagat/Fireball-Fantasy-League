import {
	StadiumResponseDto,
	UpdateGameRequestDto,
	UpdateGameScoreRequestDto,
} from "@/dtos/gameDtos";
import { GameStatsDto } from "@/dtos/gameDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function updateGame(game: UpdateGameRequestDto, token: string) {
	const response = await fetch(`${API_URL}/api/admin/games`, {
		method: "PUT",
		body: JSON.stringify(game),
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to update game");
	}

	return response.json();
}

export async function getGameStats(gameId: string) {
	const response = await fetch(`${API_URL}/api/games/${gameId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch game stats");
	}
	const data: GameStatsDto = await response.json();
	return data;
}

export async function updateGameScore(
	gameId: string,
	game: UpdateGameScoreRequestDto,
	token: string,
) {
	const response = await fetch(`${API_URL}/api/admin/games/${gameId}`, {
		method: "PATCH",
		body: JSON.stringify(game),
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to update game");
	}

	return await response.json();
}

export async function updateGameStats(
	gameId: string,
	token: string,
	file: File,
) {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch(`/api/admin/games/${gameId}/stats`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Failed to update game stats: ${response.status}`);
	}

	return response.json();
}

export async function getStadiums() {
	const response = await fetch(`${API_URL}/api/stadiums`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to update game");
	}

	const data: StadiumResponseDto = await response.json();

	return data;
}
