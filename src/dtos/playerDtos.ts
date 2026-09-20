import { TeamDto } from "./teamDtos";
import { TeamLineupPosition } from "./teamDtos";

export type PlayerDto = {
	id: string;
	name: string;
	teamId: string | null;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string;
};

export type BasicPlayerDto = {
	id: string;
	name: string;
	image: string | null;
};

export type PlayerStatsResponseDto = {
	players: PlayerWithStatsDto[];
};

export type PlayerStatsDto = {
	// Batting
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	plateAppearances: number | null;
	strikeoutsBatted: number | null;
	hitByPitch: number | null;
	singles: number | null;
	doubles: number | null;
	triples: number | null;
	oneHr: number | null;
	twoHr: number | null;
	threeHr: number | null;
	grandSlams: number | null;
	totalBases: number | null;
	sacFlies: number | null;
	startHits: number | null;
	starsUsedBatting: number | null;

	// Baserunning
	stolenBases: number | null;
	caughtStealing: number | null;
	stealAttempts: number | null;

	// Fielding
	putout: number | null;
	assist: number | null;
	fieldingErrors: number | null;
	buddyJumpPutouts: number | null;
	buddyJumpAttempts: number | null;
	doublePlays: number | null;
	triplePlays: number | null;
	bobbles: number | null;

	// Pitching
	inningsPitched: number;
	outsPitched: number;
	runsAllowed: number;
	outs: number;
	battersFaced: number | null;
	pitches: number | null;
	strikes: number | null;
	balls: number | null;
	beanBalls: number | null;
	hitsAllowed: number | null;
	singlesAllowed: number | null;
	doublesAllowed: number | null;
	triplesAllowed: number | null;
	homeRunsAllowed: number | null;
	inheritedRuns: number | null;
	starPitches: number | null;
	starsUsedPitching: number | null;
	pickoffs: number | null;
	pickoffAttempts: number | null;

	// Derived stats
	battingAverage: number;
	era: number;
	obp: number | null;
	slg: number | null;
	ops: number | null;
	whip: number | null;
	baa: number | null;
	obpAgainst: number | null;
	slgAgainst: number | null;
	opsAgainst: number | null;
	gamesPlayed: number;
};

export type BasicPlayerStatsDto = {
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
	inningsPitched: number;
	runsAllowed: number;
	outs: number;
	battingAverage: number;
	era: number;
};

export type PlayerStatsWithIdDto = PlayerStatsDto & {
	playerId: string;
	playerName: string;
	playerImage: string | null;
};

export type PlayerWithStatsDto = {
	id: string;
	name: string;
	teamId: string | null;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string | null;
	playerCardImage: string | null;
	position: TeamLineupPosition | null;
	stats: PlayerStatsDto;
};

export type PlayerGameStatsDto = {
	gameId: string;
	week: number;
	playedAt: Date | null;
	team: TeamDto;
	opponent: TeamDto;
	teamScore: number | null;
	opponentScore: number | null;
	teamOutcome: string | null;
	opponentOutcome: string | null;
	stats: PlayerStatsWithIdDto;
};

export type PlayerGameResponseDto = {
	games: PlayerGameStatsDto[];
};

export type PlayerHistoryDto = {
	id: string;
	teamId: string;
	seasonId: number;
	tradeId: string | null;
	playerId: string;
	draftRound: number | null;
	draftPick: number | null;
	type: "Draft" | "Trade";
	createdAt: Date;
	team: TeamDto;
};

export type PlayerHistoryResponseDto = {
	history: PlayerHistoryDto[];
};

export type CareerStatsDto = {
	seasonId: number;
	playerId: string;
	playerName: string;

	// Batting
	atBats: number;
	hits: number;
	runs: number;
	rbis: number;
	walks: number;
	strikeouts: number;
	homeRuns: number;
	plateAppearances: number | null;
	strikeoutsBatted: number | null;
	hitByPitch: number | null;
	singles: number | null;
	doubles: number | null;
	triples: number | null;
	oneHr: number | null;
	twoHr: number | null;
	threeHr: number | null;
	grandSlams: number | null;
	totalBases: number | null;
	sacFlies: number | null;
	startHits: number | null;
	starsUsedBatting: number | null;

	// Baserunning
	stolenBases: number | null;
	caughtStealing: number | null;
	stealAttempts: number | null;

	// Fielding
	putout: number | null;
	assist: number | null;
	fieldingErrors: number | null;
	buddyJumpPutouts: number | null;
	buddyJumpAttempts: number | null;
	doublePlays: number | null;
	triplePlays: number | null;
	bobbles: number | null;

	// Pitching
	inningsPitched: number;
	outsPitched: number;
	runsAllowed: number;
	outs: number;
	battersFaced: number | null;
	pitches: number | null;
	strikes: number | null;
	balls: number | null;
	beanBalls: number | null;
	hitsAllowed: number | null;
	singlesAllowed: number | null;
	doublesAllowed: number | null;
	triplesAllowed: number | null;
	homeRunsAllowed: number | null;
	inheritedRuns: number | null;
	starPitches: number | null;
	starsUsedPitching: number | null;
	pickoffs: number | null;
	pickoffAttempts: number | null;

	// Derived career stats
	battingAverage: number;
	era: number;
	obp: number | null;
	slg: number | null;
	ops: number | null;
	whip: number | null;
	baa: number | null;
	obpAgainst: number | null;
	slgAgainst: number | null;
	opsAgainst: number | null;

	// Teams
	teamsPlayedFor: string[] | null;
};

export type PlayerCareerStatsDto = {
	id: string;
	name: string;
	team: TeamDto | null;
	image: string | null;
	isCaptain: boolean;
	batting: number;
	pitching: number;
	running: number;
	fielding: number;
	starSwing: string | null;
	starPitch: string | null;
	fieldingAbility: string | null;
	careerStats: CareerStatsDto[];
};
