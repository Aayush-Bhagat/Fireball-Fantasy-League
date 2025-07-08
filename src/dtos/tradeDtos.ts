import { KeepDto, TeamDto, TeamGameDto } from "./teamDtos";
import { BasicPlayerDto } from "./playerDtos";

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
