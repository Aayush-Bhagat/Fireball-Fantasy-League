import {
    GameResponseDto,
    SeasonScheduleDto,
    SeasonScheduleResponseDto,
} from "@/dtos/gameDtos";

export async function getSeasonSchedule(season: string) {
    const response = await fetch(
        `http://localhost:3000/api/seasons/${season}/schedule`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch schedule");
    }

    const data: SeasonScheduleResponseDto = await response.json();

    return data;
}

export async function getWeeklySchedule(week: string | null, season: string) {
    const weekQuery = week ? `week=${week}` : "";

    const response = await fetch(
        `http://localhost:3000/api/seasons/${season}/games?${weekQuery}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch schedule");
    }

    const data: GameResponseDto = await response.json();

    return data;
}

export async function getTeamSchedule(teamId: string) {
    const response = await fetch(
        `http://localhost:3000/api/teams/${teamId}/schedule`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch schedule");
    }

    const data: GameResponseDto = await response.json();

    return data;
}
