import {
    PlayerCareerStatsDto,
    PlayerGameResponseDto,
    PlayerHistoryResponseDto,
    PlayerStatsResponseDto,
} from "@/dtos/playerDtos";
import { PlayerAwardsResponse } from "@/dtos/awardDtos";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export async function getPlayerGameLogs(playerId: string, season?: string) {
    const url = season
        ? `${API_URL}/api/players/${playerId}/games?season=${season}`
        : `${API_URL}/api/players/${playerId}/games`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch game logs");
    }

    const data: PlayerGameResponseDto = await response.json();

    return data;
}

export async function getPlayerHistory(playerId: string) {
    const response = await fetch(`${API_URL}/api/players/${playerId}/history`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch game logs");
    }

    const data: PlayerHistoryResponseDto = await response.json();

    return data;
}

export async function viewAllPlayers() {
    const response = await fetch(`${API_URL}/api/players`, {
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
    const response = await fetch(`${API_URL}/api/players/${playerId}/career`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch career stats");
    }

    const data: PlayerCareerStatsDto = await response.json();

    return data;
}

export async function getPlayerAwards(playerId: string) {
    const response = await fetch(`${API_URL}/api/players/${playerId}/awards`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch player awards");
    }

    const data: PlayerAwardsResponse = await response.json();

    return data;
}

export async function viewFreeAgents() {
    const response = await fetch(`${API_URL}/api/players/free-agents`, {
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
