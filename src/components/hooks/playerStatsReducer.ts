import { BasicPlayerDto } from "@/dtos/playerDtos";

export type PlayerStats = {
	playerId: string;
	playerName: string;
	playerImage: string | null;
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	outsPitched: number;
	runsAllowed: number;
	outs: number;
};

type PlayerStatsState = PlayerStats[];

export type PlayerStatsAction =
	| {
			type: "REPLACE_ALL";
			payload: PlayerStats[];
	  }
	| {
			type:
				| "atBats"
				| "hits"
				| "runs"
				| "walks"
				| "rbis"
				| "strikeouts"
				| "homeRuns"
				| "outsPitched"
				| "runsAllowed"
				| "outs";
			payload: {
				value: number;
				playerId: string;
			};
	  };

export const initialPlayerStatsState = (
	players: BasicPlayerDto[]
): PlayerStatsState => {
	return players.map((player) => ({
		playerId: player.id,
		playerName: player.name,
		playerImage: player.image,
		atBats: 0,
		hits: 0,
		runs: 0,
		rbis: 0,
		walks: 0,
		strikeouts: 0,
		homeRuns: 0,
		outsPitched: 0,
		runsAllowed: 0,
		outs: 0,
	}));
};

const playerStatsReducer = (
	state: PlayerStatsState,
	action: PlayerStatsAction
) => {
	switch (action.type) {
		case "REPLACE_ALL":
			return action.payload;
		case "atBats":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, atBats: action.payload.value }
					: player
			);
		case "hits":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, hits: action.payload.value }
					: player
			);
		case "runs":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, runs: action.payload.value }
					: player
			);
		case "rbis":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, rbis: action.payload.value }
					: player
			);
		case "walks":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, walks: action.payload.value }
					: player
			);
		case "strikeouts":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, strikeouts: action.payload.value }
					: player
			);
		case "homeRuns":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, homeRuns: action.payload.value }
					: player
			);
		case "outsPitched":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, outsPitched: action.payload.value }
					: player
			);
		case "runsAllowed":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, runsAllowed: action.payload.value }
					: player
			);
		case "outs":
			return state.map((player) =>
				player.playerId === action.payload.playerId
					? { ...player, outs: action.payload.value }
					: player
			);
		default:
			return state;
	}
};

export default playerStatsReducer;
