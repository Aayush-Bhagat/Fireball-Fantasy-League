import { StandingsDto } from "@/dtos/teamDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStandings(seasonId: string) {
	const response = await fetch(
		`${API_URL}/api/seasons/${seasonId}/standings`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch standings");
	}

	const data: StandingsDto = await response.json();

	return data;
}
