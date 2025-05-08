import { TradeResponseDto } from "@/dtos/tradeDtos";

export async function getTrades() {
    const response = await fetch("http://localhost:3000/api/trades");
    if (!response.ok) {
        throw new Error("Failed to fetch trades");
    }
    const data: TradeResponseDto = await response.json();
    return data;
}
