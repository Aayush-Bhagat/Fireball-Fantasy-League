import { SeasonResponseDto } from "@/dtos/seasonDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllSeasons() {
    const response = await fetch(`${API_URL}/api/seasons`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch seasons");
    }

    const data: SeasonResponseDto = await response.json();

    return data;
}
