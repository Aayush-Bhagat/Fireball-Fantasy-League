import {
	findPlayersByTeam,
	updatePlayerTeam,
	updatePlayerPosition,
	savePlayerHistory,
} from "@/repositories/playerRepository";
import { CreateTradeAsset } from "./../models/trades";
import { CreateTradeDto } from "./../dtos/tradeDtos";
import {
	addTradeAssets,
	findCompletedTrades,
	findTradeById,
	findTradeByTeamId,
	saveTrade,
	updateTradeStatus,
} from "@/repositories/tradeRepositories";
import {
	findTeamByUserId,
	findTeamKeeps,
	resetTeamBattingOrder,
	updateKeepTeam,
} from "@/repositories/teamRepository";
import { TeamTradeResponseDto, TradeDto } from "@/dtos/tradeDtos";
import { v7 as uuidV7 } from "uuid";

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

export async function createTrade(userId: string, trade: CreateTradeDto) {
	//Checking if both sides of trade have equal number of players
	if (
		trade.proposingTeamPlayers.length != trade.receivingTeamPlayers.length
	) {
		throw new Error(
			"Proposing team players and receiving team players must be of equal length"
		);
	}

	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	// Checking if all players in the trade are part of their respective teams
	const proposingTeamRoster = await findPlayersByTeam(team.id);
	const receivingTeamRoster = await findPlayersByTeam(trade.receivingTeamId);

	const proposingTeamPlayerIds = proposingTeamRoster.map(
		(player) => player.id
	);
	const receivingTeamPlayerIds = receivingTeamRoster.map(
		(player) => player.id
	);

	const isProposingTeamValid = trade.proposingTeamPlayers.every((playerId) =>
		proposingTeamPlayerIds.includes(playerId)
	);
	const isReceivingTeamValid = trade.receivingTeamPlayers.every((playerId) =>
		receivingTeamPlayerIds.includes(playerId)
	);

	if (!isProposingTeamValid || !isReceivingTeamValid) {
		throw new Error(
			"One or more players in the trade are not part of the proposing or receiving team"
		);
	}

	// Checking if all keeps in the trade are part of their respective teams
	const proposingTeamKeeps = await findTeamKeeps(team.id);
	const receivingTeamKeeps = await findTeamKeeps(trade.receivingTeamId);
	const proposingTeamKeepIds = proposingTeamKeeps.map((keep) => keep.id);
	const receivingTeamKeepIds = receivingTeamKeeps.map((keep) => keep.id);
	const isProposingKeepsValid = trade.proposingTeamKeeps.every((keepId) =>
		proposingTeamKeepIds.includes(keepId)
	);
	const isReceivingKeepsValid = trade.receivingTeamKeeps.every((keepId) =>
		receivingTeamKeepIds.includes(keepId)
	);

	if (!isProposingKeepsValid || !isReceivingKeepsValid) {
		throw new Error(
			"One or more keeps in the trade are not part of the proposing or receiving team"
		);
	}

	// saving trade in database
	const tradeId = uuidV7();

	await saveTrade(tradeId, team.id, trade.receivingTeamId);

	// Adding trade assets for both teams
	const proposingTeamAssets: CreateTradeAsset[] = [];

	trade.proposingTeamPlayers.forEach((playerId) => {
		proposingTeamAssets.push({
			id: uuidV7(),
			tradeId,
			playerId,
			keepId: null,
			fromTeamId: team.id,
			toTeamId: trade.receivingTeamId,
			assetType: "Player",
		});
	});

	trade.proposingTeamKeeps.forEach((keepId) => {
		proposingTeamAssets.push({
			id: uuidV7(),
			tradeId,
			playerId: null,
			keepId,
			fromTeamId: team.id,
			toTeamId: trade.receivingTeamId,
			assetType: "Keep",
		});
	});

	await addTradeAssets(proposingTeamAssets);

	const receivingTeamAssets: CreateTradeAsset[] = [];

	trade.receivingTeamPlayers.forEach((playerId) => {
		receivingTeamAssets.push({
			id: uuidV7(),
			tradeId,
			playerId,
			keepId: null,
			fromTeamId: trade.receivingTeamId,
			toTeamId: team.id,
			assetType: "Player",
		});
	});

	trade.receivingTeamKeeps.forEach((keepId) => {
		receivingTeamAssets.push({
			id: uuidV7(),
			tradeId,
			playerId: null,
			keepId,
			fromTeamId: trade.receivingTeamId,
			toTeamId: team.id,
			assetType: "Keep",
		});
	});

	await addTradeAssets(receivingTeamAssets);

	return tradeId;
}

export async function acceptTrade(userId: string, tradeId: string) {
	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	const trade = await findTradeById(tradeId);

	if (!trade) {
		throw new Error("Trade not found");
	}

	if (trade.status !== "Pending") {
		throw new Error("Trade is not pending");
	}
	// Check if the team accepting the trade is the receiving team of the trade
	if (team.id !== trade.receivingTeamId) {
		throw new Error("Unauthorized to accept this trade");
	}

	// Check if all players and keeps are still part of their respective teams

	const proposingTeamPlayers = await findPlayersByTeam(trade.proposingTeamId);

	const proposingTeamPlayerIds = proposingTeamPlayers.map(
		(player) => player.id
	);
	const receivingTeamPlayers = await findPlayersByTeam(trade.receivingTeamId);

	const receivingTeamPlayerIds = receivingTeamPlayers.map(
		(player) => player.id
	);

	const proposingTeamKeeps = await findTeamKeeps(trade.proposingTeamId);

	const proposingTeamKeepIds = proposingTeamKeeps.map((keep) => keep.id);

	const receivingTeamKeeps = await findTeamKeeps(trade.receivingTeamId);

	const receivingTeamKeepIds = receivingTeamKeeps.map((keep) => keep.id);

	const isValidTrade = trade.tradeAssets.every((asset) => {
		if (asset.assetType === "Player" && asset.playerId) {
			if (asset.fromTeamId === trade.proposingTeamId) {
				return proposingTeamPlayerIds.includes(asset.playerId);
			} else {
				return receivingTeamPlayerIds.includes(asset.playerId);
			}
		} else if (asset.assetType === "Keep" && asset.keepId) {
			if (asset.fromTeamId === trade.proposingTeamId) {
				return proposingTeamKeepIds.includes(asset.keepId);
			} else {
				return receivingTeamKeepIds.includes(asset.keepId);
			}
		}
	});

	if (!isValidTrade) {
		throw new Error("Invalid trade assets");
	}

	// Process the trade assets
	trade.tradeAssets.forEach(async (asset) => {
		if (asset.assetType === "Player" && asset.playerId) {
			// Update player team and position
			await updatePlayerTeam(asset.playerId, asset.toTeamId);
			await updatePlayerPosition(asset.playerId, null);
			// Reset batting order for the team receiving the player
			await resetTeamBattingOrder(asset.toTeamId);
			// Updating player history
			const playerHistoryId = uuidV7();
			await savePlayerHistory(
				playerHistoryId,
				asset.playerId,
				asset.toTeamId,
				"Trade",
				tradeId
			);
		} else if (asset.assetType === "Keep" && asset.keepId) {
			// Update keep team
			await updateKeepTeam(asset.keepId, asset.toTeamId);
		}
	});

	await updateTradeStatus("Accepted", tradeId);
}

export async function declineTrade(userId: string, tradeId: string) {
	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	const trade = await findTradeById(tradeId);

	if (!trade) {
		throw new Error("Trade not found");
	}

	if (trade.status !== "Pending") {
		throw new Error("Trade is not pending");
	}

	// Check if the team declining the trade is the receiving team of the trade
	if (team.id !== trade.receivingTeamId) {
		throw new Error("Unauthorized to decline this trade");
	}

	await updateTradeStatus("Declined", tradeId);
}

export async function cancelTrade(userId: string, tradeId: string) {
	const team = await findTeamByUserId(userId);

	if (!team) {
		throw new Error("Team not found");
	}

	const trade = await findTradeById(tradeId);

	if (!trade) {
		throw new Error("Trade not found");
	}

	if (trade.status !== "Pending") {
		throw new Error("Trade is not pending");
	}

	// Check if the team canceling the trade is the proposing team of the trade
	if (team.id !== trade.proposingTeamId) {
		throw new Error("Unauthorized to cancel this trade");
	}

	await updateTradeStatus("Canceled", tradeId);
}
