import {
    EditBattingOrderRequestDto,
    EditLineupRequestDto,
    TeamLineupDto,
} from "@/dtos/teamDtos";

export async function getLineup(token: string) {
    const response = await fetch(
        `http://localhost:3000/api/users/teams/lineup`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch lineup");
    }

    const data: TeamLineupDto = await response.json();

    return data;
}

export async function getTeamLineup(teamId: string) {
    const response = await fetch(
        `http://localhost:3000/api/teams/${teamId}/lineup`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch lineup");
    }

    const data: TeamLineupDto = await response.json();

    return data;
}

export async function saveLineup(lineup: EditLineupRequestDto, token: string) {
    const response = await fetch(
        `http://localhost:3000/api/users/teams/lineup/fielding`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(lineup),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to save lineup");
    }
}

export async function saveBattingOrder(
    battingOrder: EditBattingOrderRequestDto,
    token: string
) {
    const response = await fetch(
        `http://localhost:3000/api/users/teams/lineup/batting`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(battingOrder),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to save batting order");
    }
}
