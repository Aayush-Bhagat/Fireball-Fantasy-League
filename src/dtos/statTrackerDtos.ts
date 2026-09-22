import { TeamLineupPosition } from "./teamDtos";

export type StatTrackerBattingStats = {
	Team: string;
	Player: string;
	Position: string;
	"At-Bats": number;
	"Plate Appearances": number;
	Runs: number;
	Hits: number;
	RBI: number;
	Strikeouts: number;
	Walks: number;
	"Hit By Pitch": number;
	Singles: number;
	Doubles: number;
	Triples: number;
	"Home Runs": number;
	"1HR": number;
	"2HR": number;
	"3HR": number;
	"Grand Slams": number;
	"ITP Home Runs": number;
	"Total Bases": number;
	"Sac Flys": number;
	"Star Hits": number;
	"Stars Used": number;
	"Batting Average": number;
	"On Base %": number;
	"Slug %": number;
	"On Base + Slug": number;
	"Stolen Bases": number;
	"Caught Stealing": number;
	"Steal Attempts": number;
	Putouts: number;
	Assists: number;
	"Buddy Jump Putouts": number;
	"Buddy Jump Attempts": number;
	"Double Plays": number;
	"Triple Plays": number;
	Bobbles: number;
	"Star Bases Helper": number;
};

export type StatTrackerBattingStatsPlayer = StatTrackerBattingStats & {
	playerId: string;
	teamId: string | null;
	position: TeamLineupPosition | null;
	battingOrder: number | null;
};

export type StatTrackerPitchingStats = {
	Player: string;
	Team: string;
	"Batters Faced": number;
	"Innings Pitched": number;
	Pitches: number;
	Strikes: number;
	Balls: number;
	Strikeouts: number;
	Walks: number;
	"Bean Balls": number;
	"Hits Allowed": number;
	"Runs Allowed": number;
	"Singles Allowed": number;
	"Doubles Allowed": number;
	"Triples Allowed": number;
	"HR Allowed": number;
	"Earned Runs": number;
	"Inherited Runs": number;
	"Star Pitches": number;
	"Stars Used": number;
	Pickoffs: number;
	"Pickoff Attempts": number;
	"ERA-7": number;
	"ERA-9": number;
	WHIP: number;
	"BA Against": number;
	"OB% Against": number;
	"SLG Against": number;
	"OPS Against": number;
	"At-Bats Against Helper": number;
	"Total Bases Allowed Helper": number;
};

export type StatTrackerPitchingStatsPlayer = StatTrackerPitchingStats & {
	playerId: string;
	teamId: string | null;
};
