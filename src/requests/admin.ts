import { AdminGameDto } from "@/dtos/gameDtos";

export async function getAdminGame(gameId: string, token: string) {
	const res = await fetch(`http://localhost:3000/api/admin/games/${gameId}`, {
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
