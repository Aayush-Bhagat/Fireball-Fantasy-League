import {
	findCompletedTrades,
	findTradeByTeamId,
} from "@/repositories/tradeRepositories";
import { findTeamByUserId } from "@/repositories/teamRepository";
import { TeamTradeResponseDto, TradeDto } from "@/dtos/tradeDtos";

export async function getCurrentSeasonTrades() {
	const completedTrades = await findCompletedTrades();

	const trades: TradeDto[] = completedTrades.map((trade) => ({
		id: trade.id,
		proposingTeam: trade.proposingTeam,
		receivingTeam: trade.receivingTeam,
		receivingTeamReceivedAssets: trade.tradeAssets
			.filter((asset) => asset.toTeamId === trade.receivingTeamId)
			.map((asset) => ({
				player: asset.player,
				keep: asset.keep,
				type: asset.assetType,
			})),
		proposingTeamReceivedAssets: trade.tradeAssets
			.filter((asset) => asset.toTeamId === trade.proposingTeamId)
			.map((asset) => ({
				player: asset.player,
				keep: asset.keep,
				type: asset.assetType,
			})),
		status: trade.status,
		proposedAt: trade.proposedAt,
		resolvedAt: trade.resolvedAt,
	}));

	return trades;
}

export async function getTeamTrades(userId: string) {
	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	const trades = await findTradeByTeamId(team.id);

	const teamTrades: TradeDto[] = trades.map((trade) => ({
		id: trade.id,
		proposingTeam: trade.proposingTeam,
		receivingTeam: trade.receivingTeam,
		receivingTeamReceivedAssets: trade.tradeAssets
			.filter((asset) => asset.toTeamId === trade.receivingTeamId)
			.map((asset) => ({
				player: asset.player,
				keep: asset.keep,
				type: asset.assetType,
			})),
		proposingTeamReceivedAssets: trade.tradeAssets
			.filter((asset) => asset.toTeamId === trade.proposingTeamId)
			.map((asset) => ({
				player: asset.player,
				keep: asset.keep,
				type: asset.assetType,
			})),
		status: trade.status,
		proposedAt: trade.proposedAt,
		resolvedAt: trade.resolvedAt,
	}));

	const response: TeamTradeResponseDto = {
		trades: teamTrades,
		teamId: team.id,
	};

	return response;
}
