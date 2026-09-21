import * as XLSX from "xlsx";

export function setPlayerGameStats() {
	const workbook = XLSX.readFile("./example_game.xlsx");

	const battingSheet = workbook.Sheets["Stats"];

	const battingData = XLSX.utils.sheet_to_json(battingSheet, {
		header: 1,
	}) as string[][];

	console.log(battingData);
}
