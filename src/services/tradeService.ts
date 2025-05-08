import { findCompletedTrades } from "@/repositories/tradeRepositories";
import { TradeDto } from "@/dtos/tradeDtos";
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
