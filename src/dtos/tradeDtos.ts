import { KeepDto, TeamDto, TeamGameDto } from "./teamDtos";
import { BasicPlayerDto } from "./playerDtos";
import { z } from "zod";

export type TradeAssetDto = {
	player: BasicPlayerDto | null;
	keep: KeepDto | null;
	type: "Player" | "Keep";
};

export type TradeDto = {
	id: string;
	proposingTeam: TeamGameDto;
	receivingTeam: TeamGameDto;
	receivingTeamReceivedAssets: TradeAssetDto[];
	proposingTeamReceivedAssets: TradeAssetDto[];
	status: "Pending" | "Accepted" | "Declined" | "Countered" | "Canceled";
	proposedAt: Date;
	resolvedAt: Date | null;
};

export type TradeResponseDto = {
	trades: TradeDto[];
};

export type TeamTradeResponseDto = {
	trades: TradeDto[];
	teamId: string;
};

export type TeamTradeAsset = TeamDto & {
	players: BasicPlayerDto[];
	keeps: KeepDto[];
};

export type TeamTradeAssetsDto = {
	teamAssets: TeamTradeAsset;
	availableAssets: TeamTradeAsset[];
};

export const CreateTradeSchema = z.object({
	receivingTeamId: z.string(),
	proposingTeamPlayers: z.array(z.string()),
	proposingTeamKeeps: z.array(z.string()),
	receivingTeamPlayers: z.array(z.string()),
	receivingTeamKeeps: z.array(z.string()),
});

export type CreateTradeDto = z.infer<typeof CreateTradeSchema>;

export type CreateTradeAsset = {
	id: string;
	tradeId: string;
	playerId?: string;
	keepId?: string;
	fromTeamId: string;
	toTeamId: string;
	assetType: "Player" | "Keep";
};
