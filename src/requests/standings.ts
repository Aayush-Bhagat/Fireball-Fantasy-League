import { StandingsDto } from "@/dtos/teamDtos";

export async function getStandings(seasonId: string) {
    const response = await fetch(
        `http://localhost:3000/api/seasons/${seasonId}/standings`,
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
