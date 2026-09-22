import {
	StatTrackerBattingStats,
	StatTrackerPitchingStats,
} from "@/dtos/statTrackerDtos";
import { TeamLineupPosition } from "@/dtos/teamDtos";
import {
	createPlayerGameStats,
	findPlayersByName,
	updatePlayerGamePitchingStats,
} from "@/repositories/playerRepository";
import * as XLSX from "xlsx";

export async function setPlayerGameStats(gameId: string, file: Buffer) {
	const MII_ID = "01969260-eab9-76cb-95e6-6ef3ed3b8422";
	let isMii = false;

	const workbook = XLSX.read(file, { type: "buffer" });

	// importing batting stats
	const battingSheet = workbook.Sheets["Stats"];

	let battingData =
		XLSX.utils.sheet_to_json<StatTrackerBattingStats>(battingSheet);

	battingData = battingData.filter((row) => row.Position !== "N/A");

	const playerNames = battingData.map((row) => {
		if (row.Player.includes("Mii")) {
			isMii = true;
		}
		return row.Player;
	});

	const players = await findPlayersByName(playerNames, isMii ? MII_ID : null);

	const playerBattingStats = battingData.map((row) => {
		const player = players.find((p) => {
			if (row.Player.includes("Mii")) {
				return p.id === MII_ID;
			}
			return p.name === row.Player;
		});

		if (!player) {
			throw new Error(`Player not found: ${row.Player}`);
		}

		return {
			playerId: player.id,
			teamId: player.teamId,
			position: row.Position.split(",")[0] as TeamLineupPosition,
			battingOrder: player.teamLineups?.battingOrder ?? null,
			...row,
		};
	});

	await createPlayerGameStats(gameId, playerBattingStats);

	// importing pitching stats

	const pitchingSheet = workbook.Sheets["Pitching"];

	let pitchingData =
		XLSX.utils.sheet_to_json<StatTrackerPitchingStats>(pitchingSheet);

	pitchingData = pitchingData.filter((row) => row.Pitches !== undefined);

	const playerPitchingStats = pitchingData.map((row) => {
		const player = players.find((p) => {
			if (row.Player.includes("Mii")) {
				return p.id === MII_ID;
			}
			return p.name === row.Player;
		});

		if (!player) {
			throw new Error(`Player not found: ${row.Player}`);
		}

		return {
			playerId: player.id,
			teamId: player.teamId,
			...row,
		};
	});

	await updatePlayerGamePitchingStats(gameId, playerPitchingStats);
}
