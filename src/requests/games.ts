import { UpdateGameRequestDto } from "@/dtos/gameDtos";
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
