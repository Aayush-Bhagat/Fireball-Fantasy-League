import { TradeResponseDto } from "@/dtos/tradeDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTrades() {
	const response = await fetch(`${API_URL}/api/trades`);
	if (!response.ok) {
		throw new Error("Failed to fetch trades");
	}
	const data: TradeResponseDto = await response.json();
	return data;
}
