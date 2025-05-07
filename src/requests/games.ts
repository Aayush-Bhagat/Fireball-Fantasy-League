import { UpdateGameRequestDto } from "@/dtos/gameDtos";

export async function updateGame(game: UpdateGameRequestDto, token: string) {
	const response = await fetch(`/api/admin/games`, {
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
