import { AdminGameDto } from "@/dtos/gameDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAdminGame(gameId: string, token: string) {
	const res = await fetch(`${API_URL}/api/admin/games/${gameId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		throw new Error("Failed to fetch game");
	}

	const data: AdminGameDto = await res.json();

	return data;
}
