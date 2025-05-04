import { TeamRecord, TeamRecordMap } from "@/dtos/teamDtos";

export function buildTeamRecordsMap(records: TeamRecord[]): TeamRecordMap {
	const teamRecords: TeamRecordMap = {};

	records.forEach((record) => {
		const teamId = record.teamId;

		teamRecords[teamId] = {
			wins: record.wins,
			losses: record.losses,
		};
	});

	return teamRecords;
}
