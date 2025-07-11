import {
    CreateTradeDto,
    TeamTradeAssetsDto,
    TeamTradeResponseDto,
    TradeResponseDto,
} from "@/dtos/tradeDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTrades() {
    const response = await fetch(`${API_URL}/api/trades`);
    if (!response.ok) {
        throw new Error("Failed to fetch trades");
    }
    const data: TradeResponseDto = await response.json();
    return data;
}

export async function getTradeAssets(token: string) {
    const response = await fetch(`${API_URL}/api/teams/assets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch trade assets");
    }
    const data: TeamTradeAssetsDto = await response.json();
    return data;
}

export async function getTeamTrades(token: string) {
    const response = await fetch(`${API_URL}/api/users/teams/trades`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch trade details");
    }
    const data: TeamTradeResponseDto = await response.json();
    return data;
}

export async function sendTradeRequest(
    token: string,
    tradeData: CreateTradeDto
) {
    const response = await fetch(`${API_URL}/api/trades`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
    });

    if (!response.ok) {
        throw new Error("Failed to send trade request");
    }

    const data = await response.json();
    return data;
}

export async function acceptTrade(token: string, tradeId: string) {
    const response = await fetch(`${API_URL}/api/trades/${tradeId}/accept`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to accept trade");
    }

    const data = await response.json();
    return data;
}

export async function declineTrade(token: string, tradeId: string) {
    const response = await fetch(`${API_URL}/api/trades/${tradeId}/decline`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to decline trade");
    }

    const data = await response.json();
    return data;
}

export async function cancelTrade(token: string, tradeId: string) {
    const response = await fetch(`${API_URL}/api/trades/${tradeId}/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to cancel trade");
    }

    const data = await response.json();
    return data;
}
