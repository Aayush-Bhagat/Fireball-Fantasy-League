import {
    PlayerCareerStatsDto,
    PlayerGameResponseDto,
    PlayerHistoryDto,
    PlayerHistoryResponseDto,
    PlayerStatsResponseDto,
} from "@/dtos/playerDtos";

export async function getPlayerGameLogs(playerId: string) {
    const response = await fetch(
        `http://localhost:3000/api/players/${playerId}/games`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch game logs");
    }

    const data: PlayerGameResponseDto = await response.json();

    return data;
}

export async function getPlayerHistory(playerId: string) {
    const response = await fetch(
        `http://localhost:3000/api/players/${playerId}/history`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch game logs");
    }

    const data: PlayerHistoryResponseDto = await response.json();

    return data;
}

export async function viewAllPlayers() {
    const response = await fetch("http://localhost:3000/api/players", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch players");
    }

    const data: PlayerStatsResponseDto = await response.json();

    return data;
}

export async function getCareerStats(playerId: string) {
    const response = await fetch(
        `http://localhost:3000/api/players/${playerId}/career`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch career stats");
    }

    const data: PlayerCareerStatsDto = await response.json();

    return data;
}
