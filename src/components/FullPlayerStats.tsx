"use client";

import Link from "next/link";
import {
	ArrowLeft,
	Award,
	BarChart3,
	CalendarDays,
	ChevronRight,
	Clock3,
	Crosshair,
	Gauge,
	History,
	Search,
	Shield,
	Trophy,
	UserRound,
	X,
	Zap,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CareerStatsDto, PlayerWithStatsDto } from "@/dtos/playerDtos";

import { getCareerStats, viewAllPlayers } from "@/requests/players";

import PlayerHistory from "./playerHistory";
import PlayerAwards from "./playerAwards";
import AdvancedGameLog from "./AdvancedGameLog";
import AdvancedCareerTab from "./AdvancedCareerTab";

/* =========================================================
   TYPES
========================================================= */

type Props = {
	player: PlayerWithStatsDto;
};

type TeamTheme = {
	from: string;
	to: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const STAT_PLACEHOLDER = "—";

/* =========================================================
   TEAM THEMES
========================================================= */

const teamThemes: TeamTheme[] = [
	{ from: "#1d4ed8", to: "#4338ca" },
	{ from: "#dc2626", to: "#991b1b" },
	{ from: "#059669", to: "#047857" },
	{ from: "#7c3aed", to: "#5b21b6" },
	{ from: "#ea580c", to: "#c2410c" },
	{ from: "#0891b2", to: "#155e75" },
	{ from: "#be123c", to: "#9f1239" },
	{ from: "#ca8a04", to: "#a16207" },
	{ from: "#475569", to: "#1e293b" },
	{ from: "#0f766e", to: "#115e59" },
];

function getPlayerTheme(playerId: string): TeamTheme {
	let hash = 0;

	for (let i = 0; i < playerId.length; i++) {
		hash = (hash << 5) - hash + playerId.charCodeAt(i);
		hash |= 0;
	}

	return teamThemes[Math.abs(hash) % teamThemes.length];
}

/* =========================================================
   CALCULATION HELPERS
========================================================= */

function calculateEra(
	runsAllowed: number | null,
	outsPitched: number | null,
): number {
	if (runsAllowed === null || outsPitched === null || outsPitched === 0) {
		return 0;
	}

	const era = (runsAllowed / (outsPitched / 3)) * 9;

	if (isNaN(era) || !isFinite(era)) {
		return 0;
	}

	return parseFloat(era.toFixed(2));
}

function calculateInningsPitched(outsPitched: number | null): number {
	if (outsPitched === null) {
		return 0;
	}

	const inningsPitched = Math.floor(outsPitched / 3);
	const outs = outsPitched % 3;

	return Number(`${inningsPitched}.${outs}`);
}

function calculateOBP(
	hits: number | null,
	walks: number | null,
	hitByPitch: number | null,
	atBats: number | null,
	sacrificeFlies: number | null,
): number | null {
	if (
		hits === null ||
		walks === null ||
		hitByPitch === null ||
		atBats === null ||
		sacrificeFlies === null
	) {
		return null;
	}

	const plateAppearances = atBats + walks + hitByPitch + sacrificeFlies;

	if (plateAppearances === 0) {
		return null;
	}

	const obp = (hits + walks + hitByPitch) / plateAppearances;

	return parseFloat(obp.toFixed(3));
}

function calculateSLG(
	hits: number | null,
	singles: number | null,
	doubles: number | null,
	triples: number | null,
	homeRuns: number | null,
	atBats: number | null,
): number | null {
	if (
		hits === null ||
		singles === null ||
		doubles === null ||
		triples === null ||
		homeRuns === null ||
		atBats === null
	) {
		return null;
	}

	if (atBats === 0) {
		return null;
	}

	const totalBases = singles + 2 * doubles + 3 * triples + 4 * homeRuns;

	const slg = totalBases / atBats;

	return parseFloat(slg.toFixed(3));
}

function calculateOPS(obp: number | null, slg: number | null): number | null {
	if (obp === null || slg === null) {
		return null;
	}

	return parseFloat((obp + slg).toFixed(3));
}

function calculateWHIP(
	walks: number | null,
	hitsAllowed: number | null,
	outsPitched: number | null,
): number | null {
	if (
		walks === null ||
		hitsAllowed === null ||
		outsPitched === null ||
		outsPitched === 0
	) {
		return null;
	}

	const inningsPitched = outsPitched / 3;

	const whip = (walks + hitsAllowed) / inningsPitched;

	return parseFloat(whip.toFixed(3));
}

function calculateBAA(
	hitsAllowed: number | null,
	atBatsAgainst: number | null,
): number | null {
	if (hitsAllowed === null || atBatsAgainst === null || atBatsAgainst === 0) {
		return null;
	}

	const baa = hitsAllowed / atBatsAgainst;

	return parseFloat(baa.toFixed(3));
}

function calculateOBPAgainst(
	hitsAllowed: number | null,
	walksAllowed: number | null,
	atBatsAgainst: number | null,
	beanBalls: number | null,
): number | null {
	if (
		hitsAllowed === null ||
		walksAllowed === null ||
		atBatsAgainst === null ||
		beanBalls === null
	) {
		return null;
	}

	const plateAppearancesAgainst = atBatsAgainst + walksAllowed + beanBalls;

	if (plateAppearancesAgainst === 0) {
		return null;
	}

	const obpAgainst = (hitsAllowed + walksAllowed) / plateAppearancesAgainst;

	return parseFloat(obpAgainst.toFixed(3));
}

function calculateSLGAgainst(
	hitsAllowed: number | null,
	singlesAllowed: number | null,
	doublesAllowed: number | null,
	triplesAllowed: number | null,
	homeRunsAllowed: number | null,
	atBatsAgainst: number | null,
): number | null {
	if (
		hitsAllowed === null ||
		singlesAllowed === null ||
		doublesAllowed === null ||
		triplesAllowed === null ||
		homeRunsAllowed === null ||
		atBatsAgainst === null
	) {
		return null;
	}

	if (atBatsAgainst === 0) {
		return null;
	}

	const totalBasesAgainst =
		singlesAllowed +
		2 * doublesAllowed +
		3 * triplesAllowed +
		4 * homeRunsAllowed;

	const slgAgainst = totalBasesAgainst / atBatsAgainst;

	return parseFloat(slgAgainst.toFixed(3));
}

function calculateOPSAgainst(
	obpAgainst: number | null,
	slgAgainst: number | null,
): number | null {
	if (obpAgainst === null || slgAgainst === null) {
		return null;
	}

	return parseFloat((obpAgainst + slgAgainst).toFixed(3));
}

/* =========================================================
   SUM NULLABLE CAREER STAT
========================================================= */

function sumNullable(
	seasons: CareerStatsDto[],
	key: keyof CareerStatsDto,
): number | null {
	const values = seasons
		.map((season) => season[key])
		.filter((value): value is number => typeof value === "number");

	if (values.length === 0) {
		return null;
	}

	return values.reduce((sum, value) => sum + value, 0);
}

/* =========================================================
   CAREER STAT CALCULATOR
========================================================= */

function calculateCareerStats(seasons: CareerStatsDto[]) {
	/* -------------------------------------------------------
       BATTING
    ------------------------------------------------------- */

	const atBats = sumNullable(seasons, "atBats") ?? 0;

	const hits = sumNullable(seasons, "hits") ?? 0;

	const runs = sumNullable(seasons, "runs") ?? 0;

	const rbis = sumNullable(seasons, "rbis") ?? 0;

	const walks = sumNullable(seasons, "walks") ?? 0;

	const strikeouts = sumNullable(seasons, "strikeouts") ?? 0;

	const homeRuns = sumNullable(seasons, "homeRuns") ?? 0;

	const plateAppearances = sumNullable(seasons, "plateAppearances");

	const hitByPitch = sumNullable(seasons, "hitByPitch");

	const singles = sumNullable(seasons, "singles");

	const doubles = sumNullable(seasons, "doubles");

	const triples = sumNullable(seasons, "triples");

	const oneHr = sumNullable(seasons, "oneHr");

	const twoHr = sumNullable(seasons, "twoHr");

	const threeHr = sumNullable(seasons, "threeHr");

	const grandSlams = sumNullable(seasons, "grandSlams");

	const totalBases = sumNullable(seasons, "totalBases");

	const sacFlies = sumNullable(seasons, "sacFlies");

	const starsUsedBatting = sumNullable(seasons, "starsUsedBatting");

	/* -------------------------------------------------------
       BASERUNNING
    ------------------------------------------------------- */

	const stolenBases = sumNullable(seasons, "stolenBases");

	const caughtStealing = sumNullable(seasons, "caughtStealing");

	const stealAttempts = sumNullable(seasons, "stealAttempts");

	/* -------------------------------------------------------
       FIELDING
    ------------------------------------------------------- */

	const putout = sumNullable(seasons, "outs");

	const assist = sumNullable(seasons, "assist");

	const fieldingErrors = sumNullable(seasons, "fieldingErrors");

	const buddyJumpPutouts = sumNullable(seasons, "buddyJumpPutouts");

	const buddyJumpAttempts = sumNullable(seasons, "buddyJumpAttempts");

	const doublePlays = sumNullable(seasons, "doublePlays");

	const triplePlays = sumNullable(seasons, "triplePlays");

	const bobbles = sumNullable(seasons, "bobbles");

	/* -------------------------------------------------------
       PITCHING
    ------------------------------------------------------- */

	const outsPitched = sumNullable(seasons, "outsPitched") ?? 0;

	const runsAllowed = sumNullable(seasons, "runsAllowed") ?? 0;

	const inningsPitched = calculateInningsPitched(outsPitched);

	const battersFaced = sumNullable(seasons, "battersFaced");

	const pitches = sumNullable(seasons, "pitches");

	const strikes = sumNullable(seasons, "strikes");

	const balls = sumNullable(seasons, "balls");

	const beanBalls = sumNullable(seasons, "beanBalls");

	const hitsAllowed = sumNullable(seasons, "hitsAllowed");

	const singlesAllowed = sumNullable(seasons, "singlesAllowed");

	const doublesAllowed = sumNullable(seasons, "doublesAllowed");

	const triplesAllowed = sumNullable(seasons, "triplesAllowed");

	const homeRunsAllowed = sumNullable(seasons, "homeRunsAllowed");

	const inheritedRuns = sumNullable(seasons, "inheritedRuns");

	const starPitches = sumNullable(seasons, "starPitches");

	const starsUsedPitching = sumNullable(seasons, "starsUsedPitching");

	const pickoffs = sumNullable(seasons, "pickoffs");

	const pickoffAttempts = sumNullable(seasons, "pickoffAttempts");

	/* -------------------------------------------------------
       DERIVED BATTING STATS
    ------------------------------------------------------- */

	const battingAverage = atBats > 0 ? Number((hits / atBats).toFixed(3)) : 0;

	const obp = calculateOBP(hits, walks, hitByPitch, atBats, sacFlies);

	const slg = calculateSLG(hits, singles, doubles, triples, homeRuns, atBats);

	const ops = calculateOPS(obp, slg);

	/* -------------------------------------------------------
       DERIVED PITCHING STATS
    ------------------------------------------------------- */

	const era = calculateEra(runsAllowed, outsPitched);

	const whip = calculateWHIP(walks, hitsAllowed, outsPitched);

	/* -------------------------------------------------------
       OPPONENT STATS
       
       AB Against can be derived from:
       
       Batters Faced
       - Walks
       - Hit By Pitch
    ------------------------------------------------------- */

	const atBatsAgainst =
		battersFaced !== null && beanBalls !== null
			? Math.max(0, battersFaced - walks - beanBalls)
			: null;

	const baa = calculateBAA(hitsAllowed, atBatsAgainst);

	const obpAgainst =
		atBatsAgainst !== null && beanBalls !== null
			? calculateOBPAgainst(hitsAllowed, walks, atBatsAgainst, beanBalls)
			: null;

	const slgAgainst = calculateSLGAgainst(
		hitsAllowed,
		singlesAllowed,
		doublesAllowed,
		triplesAllowed,
		homeRunsAllowed,
		atBatsAgainst,
	);

	const opsAgainst = calculateOPSAgainst(obpAgainst, slgAgainst);

	return {
		/* Batting */
		atBats,
		hits,
		runs,
		rbis,
		walks,
		strikeouts,
		homeRuns,
		plateAppearances,
		hitByPitch,
		singles,
		doubles,
		triples,
		oneHr,
		twoHr,
		threeHr,
		grandSlams,
		totalBases,
		sacFlies,
		starsUsedBatting,

		/* Baserunning */
		stolenBases,
		caughtStealing,
		stealAttempts,

		/* Fielding */
		putout,
		assist,
		fieldingErrors,
		buddyJumpPutouts,
		buddyJumpAttempts,
		doublePlays,
		triplePlays,
		bobbles,

		/* Pitching */
		inningsPitched,
		outsPitched,
		runsAllowed,
		battersFaced,
		pitches,
		strikes,
		balls,
		beanBalls,
		hitsAllowed,
		singlesAllowed,
		doublesAllowed,
		triplesAllowed,
		homeRunsAllowed,
		inheritedRuns,
		starPitches,
		starsUsedPitching,
		pickoffs,
		pickoffAttempts,

		/* Derived */
		battingAverage,
		era,
		obp,
		slg,
		ops,
		whip,
		baa,
		obpAgainst,
		slgAgainst,
		opsAgainst,
	};
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatAverage(value: number): string {
	return value.toFixed(3);
}

function formatEra(value: number): string {
	return value.toFixed(2);
}

function formatNullableStat(
	value: number | null,
	decimals = 0,
): string | number {
	if (value === null) {
		return STAT_PLACEHOLDER;
	}

	return decimals > 0 ? value.toFixed(decimals) : value;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FullPlayerStats({ player }: Props) {
	const [playerSearch, setPlayerSearch] = useState("");

	const [isSearchFocused, setIsSearchFocused] = useState(false);

	/* =====================================================
       LOAD ALL PLAYERS
    ===================================================== */

	const { data: playersResponse, isLoading: isLoadingPlayers } = useQuery({
		queryKey: ["all-players"],
		queryFn: viewAllPlayers,
	});

	const players = playersResponse?.players ?? [];

	/* =====================================================
       FILTER PLAYERS
    ===================================================== */

	const filteredPlayers = useMemo(() => {
		const search = playerSearch.trim().toLowerCase();

		if (!search) {
			return [];
		}

		return players.filter((candidate) =>
			candidate.name.toLowerCase().includes(search),
		);
	}, [players, playerSearch]);

	/* =====================================================
       CAREER DATA
    ===================================================== */

	const { data: careerSeasons, isLoading } = useQuery({
		queryKey: ["player-career-stats", player.id],
		queryFn: async () => {
			const res = await getCareerStats(player.id);

			return res.careerStats as CareerStatsDto[];
		},
	});

	/* =====================================================
       SEASONS WITH DATA
    ===================================================== */

	const playedSeasons = useMemo(() => {
		return (
			careerSeasons?.filter(
				(season) =>
					season.atBats > 0 ||
					season.hits > 0 ||
					season.runs > 0 ||
					season.rbis > 0 ||
					season.homeRuns > 0 ||
					season.inningsPitched > 0 ||
					season.outsPitched > 0 ||
					season.outs !== null ||
					season.assist !== null,
			) ?? []
		);
	}, [careerSeasons]);

	/* =====================================================
       CAREER TOTALS
    ===================================================== */

	const careerStats = useMemo(
		() => calculateCareerStats(playedSeasons),
		[playedSeasons],
	);

	/* =====================================================
       LATEST SEASON
    ===================================================== */

	const latestSeason =
		playedSeasons.length > 0
			? playedSeasons[playedSeasons.length - 1]
			: null;

	/* =====================================================
       PLAYER RATINGS
    ===================================================== */

	const teamTheme = getPlayerTheme(player.id);

	const batting = player.batting ?? 0;

	const fielding = player.fielding ?? 0;

	const pitching = player.pitching ?? 0;

	const running = player.running ?? 0;

	return (
		<div className="min-h-screen bg-slate-50">
			{/* =================================================
                TOP NAV
            ================================================= */}

			<div className="border-b border-slate-200 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{/* Left side */}

						<Link
							href="/players"
							className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
						>
							<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
							Back to Players
						</Link>

						{/* Player Search */}

						<div className="relative w-full sm:w-[340px]">
							<div
								className={`flex h-10 items-center gap-2 rounded-xl border bg-slate-50 px-3 transition ${
									isSearchFocused
										? "border-slate-300 bg-white shadow-sm ring-2 ring-slate-100"
										: "border-slate-200"
								}`}
							>
								<Search className="h-4 w-4 shrink-0 text-slate-400" />

								<input
									type="text"
									value={playerSearch}
									onChange={(e) =>
										setPlayerSearch(e.target.value)
									}
									onFocus={() => setIsSearchFocused(true)}
									placeholder="Search players..."
									className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
								/>

								{playerSearch && (
									<button
										type="button"
										onClick={() => {
											setPlayerSearch("");

											setIsSearchFocused(false);
										}}
										className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
										aria-label="Clear player search"
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>

							{/* Search Results */}

							{isSearchFocused &&
								playerSearch.trim().length > 0 && (
									<div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
										{isLoadingPlayers ? (
											<div className="space-y-2 p-3">
												{Array.from({
													length: 3,
												}).map((_, index) => (
													<div
														key={index}
														className="flex items-center gap-3 rounded-xl p-2.5"
													>
														<div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

														<div className="flex-1 space-y-2">
															<div className="h-3 w-28 animate-pulse rounded bg-slate-200" />

															<div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
														</div>
													</div>
												))}
											</div>
										) : filteredPlayers.length > 0 ? (
											<div className="max-h-[420px] overflow-y-auto p-2">
												{filteredPlayers.map(
													(candidate) => {
														const isCurrentPlayer =
															candidate.id ===
															player.id;

														return (
															<Link
																key={
																	candidate.id
																}
																href={`/players/${candidate.id}/stats`}
																onClick={() => {
																	setPlayerSearch(
																		"",
																	);

																	setIsSearchFocused(
																		false,
																	);
																}}
																className={`group flex items-center gap-3 rounded-xl p-2.5 transition ${
																	isCurrentPlayer
																		? "bg-slate-100"
																		: "hover:bg-slate-50"
																}`}
															>
																<div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
																	{candidate.playerCardImage ? (
																		<img
																			src={
																				candidate.playerCardImage
																			}
																			alt={
																				candidate.name
																			}
																			className="h-full w-full object-contain"
																		/>
																	) : (
																		<UserRound className="h-5 w-5 text-slate-400" />
																	)}
																</div>

																<div className="min-w-0 flex-1">
																	<div className="flex items-center gap-2">
																		<p className="truncate text-sm font-black text-slate-900">
																			{
																				candidate.name
																			}
																		</p>

																		{isCurrentPlayer && (
																			<span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
																				Viewing
																			</span>
																		)}
																	</div>

																	<div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
																		{candidate.position && (
																			<span className="font-semibold">
																				{
																					candidate.position
																				}
																			</span>
																		)}

																		{candidate.position &&
																			candidate
																				.team
																				?.name && (
																				<span>
																					•
																				</span>
																			)}

																		{candidate
																			.team
																			?.name && (
																			<span className="truncate">
																				{
																					candidate
																						.team
																						.name
																				}
																			</span>
																		)}
																	</div>
																</div>

																<ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
															</Link>
														);
													},
												)}
											</div>
										) : (
											<div className="px-5 py-8 text-center">
												<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
													<Search className="h-5 w-5 text-slate-400" />
												</div>

												<p className="mt-3 text-sm font-bold text-slate-700">
													No players found
												</p>

												<p className="mt-1 text-xs text-slate-400">
													Try searching for another
													player.
												</p>
											</div>
										)}
									</div>
								)}
						</div>

						{/* Page label */}

						<div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:flex">
							<BarChart3 className="h-4 w-4" />
							Player Statistics
						</div>
					</div>
				</div>
			</div>

			{/* =================================================
                PLAYER HERO
            ================================================= */}

			<section
				className="relative overflow-hidden text-white"
				style={{
					background: `linear-gradient(135deg, ${teamTheme.from}, ${teamTheme.to})`,
				}}
			>
				<div
					className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
					style={{
						backgroundColor: teamTheme.to,
					}}
				/>

				<div
					className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full opacity-20"
					style={{
						backgroundColor: teamTheme.from,
					}}
				/>

				<div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
							<div className="relative shrink-0">
								<div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl" />

								{player.playerCardImage ? (
									<img
										src={player.playerCardImage}
										alt={player.name}
										className="relative h-40 w-40 object-contain drop-shadow-2xl sm:h-48 sm:w-48"
									/>
								) : (
									<div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:h-48 sm:w-48">
										<UserRound className="h-20 w-20 text-white/60" />
									</div>
								)}
							</div>

							<div className="text-center sm:text-left">
								<div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
									{player.team?.logo && (
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1 shadow-lg">
											<img
												src={player.team.logo}
												alt={`${player.team.name ?? "Team"} logo`}
												className="h-full w-full object-contain"
											/>
										</div>
									)}

									{player.team?.abbreviation && (
										<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-sm">
											{player.team.abbreviation}
										</span>
									)}

									{player.position && (
										<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
											{player.position}
										</span>
									)}
								</div>

								<h1 className="text-4xl font-black tracking-tight sm:text-5xl">
									{player.name}
								</h1>

								{player.team?.name && (
									<p className="mt-2 text-base text-white/70">
										{player.team.name}
									</p>
								)}

								<div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
									<div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
										<CalendarDays className="h-4 w-4" />
										{playedSeasons.length}{" "}
										{playedSeasons.length === 1
											? "Season"
											: "Seasons"}
									</div>

									{latestSeason && (
										<div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
											<Clock3 className="h-4 w-4" />
											Latest Season
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Ratings */}

						<div className="w-full rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm lg:w-80">
							<div className="mb-4 flex items-center justify-between">
								<span className="text-xs font-bold uppercase tracking-widest text-white/60">
									Player Ratings
								</span>

								<Gauge className="h-4 w-4 text-white/50" />
							</div>

							<div className="space-y-4">
								<Rating
									label="Batting"
									value={batting}
									icon="/images/battingIcon.png"
								/>

								<Rating
									label="Fielding"
									value={fielding}
									icon="/images/fieldingIcon.png"
								/>

								<Rating
									label="Pitching"
									value={pitching}
									icon="/images/pitchingIcon.png"
								/>

								<Rating
									label="Running"
									value={running}
									icon="/images/runningIcon.png"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* =================================================
                CONTENT
            ================================================= */}

			<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
				{/* =================================================
                    CAREER OVERVIEW
                ================================================= */}

				<section>
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-black text-slate-900">
								Career Overview
							</h2>

							<p className="mt-1 text-sm text-slate-500">
								Complete statistical overview of {player.name}
							</p>
						</div>

						<div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 sm:flex">
							<Trophy className="h-4 w-4" />
							Career
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
						<OverviewCard
							label="AVG"
							value={formatAverage(careerStats.battingAverage)}
							icon={<Crosshair className="h-4 w-4" />}
						/>

						<OverviewCard
							label="HITS"
							value={careerStats.hits}
							icon={<Crosshair className="h-4 w-4" />}
						/>

						<OverviewCard
							label="HOME RUNS"
							value={careerStats.homeRuns}
							icon={<Zap className="h-4 w-4" />}
						/>

						<OverviewCard
							label="RBI"
							value={careerStats.rbis}
							icon={<BarChart3 className="h-4 w-4" />}
						/>

						<OverviewCard
							label="RUNS"
							value={careerStats.runs}
							icon={<Trophy className="h-4 w-4" />}
						/>

						<OverviewCard
							label="AT BATS"
							value={careerStats.atBats}
							icon={<Clock3 className="h-4 w-4" />}
						/>
					</div>

					<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
						<OverviewCard
							label="ERA"
							value={formatEra(careerStats.era)}
							icon={<Gauge className="h-4 w-4" />}
						/>

						<OverviewCard
							label="INNINGS"
							value={careerStats.inningsPitched}
							icon={<Clock3 className="h-4 w-4" />}
						/>

						<OverviewCard
							label="RUNS ALLOWED"
							value={careerStats.runsAllowed}
							icon={<Shield className="h-4 w-4" />}
						/>

						<OverviewCard
							label="WHIP"
							value={
								careerStats.whip !== null
									? careerStats.whip.toFixed(3)
									: STAT_PLACEHOLDER
							}
							icon={<Gauge className="h-4 w-4" />}
						/>
					</div>
				</section>

				{/* =================================================
                    FULL STATISTICS
                ================================================= */}

				<section className="mt-10">
					<div className="mb-5">
						<div className="flex items-end justify-between gap-4">
							<div>
								<h2 className="text-2xl font-black tracking-tight text-slate-900">
									Statistics
								</h2>

								<p className="mt-1 text-sm text-slate-500">
									Complete career statistical breakdown
								</p>
							</div>

							<div className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 sm:block">
								CAREER
							</div>
						</div>
					</div>

					<Tabs defaultValue="batting" className="w-full">
						<TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
							<TabsTrigger
								value="batting"
								className="rounded-lg py-3 text-xs font-bold sm:text-sm"
							>
								Batting
							</TabsTrigger>

							<TabsTrigger
								value="fielding"
								className="rounded-lg py-3 text-xs font-bold sm:text-sm"
							>
								Fielding
							</TabsTrigger>

							<TabsTrigger
								value="pitching"
								className="rounded-lg py-3 text-xs font-bold sm:text-sm"
							>
								Pitching
							</TabsTrigger>
						</TabsList>

						{/* =================================================
                            BATTING
                        ================================================= */}

						<TabsContent value="batting" className="mt-5 space-y-5">
							<StatGroup
								title="Batting"
								description="Overall offensive production"
							>
								<StatCard
									label="AVG"
									value={formatAverage(
										careerStats.battingAverage,
									)}
								/>

								<StatCard
									label="At Bats"
									value={careerStats.atBats}
								/>

								<StatCard
									label="Plate Appearances"
									value={formatNullableStat(
										careerStats.plateAppearances,
									)}
								/>

								<StatCard
									label="Runs"
									value={careerStats.runs}
								/>

								<StatCard
									label="Hits"
									value={careerStats.hits}
								/>

								<StatCard
									label="RBI"
									value={careerStats.rbis}
								/>

								<StatCard
									label="Strikeouts"
									value={careerStats.strikeouts}
								/>

								<StatCard
									label="Walks"
									value={careerStats.walks}
								/>

								<StatCard
									label="Hit By Pitch"
									value={formatNullableStat(
										careerStats.hitByPitch,
									)}
								/>

								<StatCard
									label="Singles"
									value={formatNullableStat(
										careerStats.singles,
									)}
								/>

								<StatCard
									label="Doubles"
									value={formatNullableStat(
										careerStats.doubles,
									)}
								/>

								<StatCard
									label="Triples"
									value={formatNullableStat(
										careerStats.triples,
									)}
								/>

								<StatCard
									label="Home Runs"
									value={careerStats.homeRuns}
								/>

								<StatCard
									label="Total Bases"
									value={formatNullableStat(
										careerStats.totalBases,
									)}
								/>

								<StatCard
									label="Sac Flies"
									value={formatNullableStat(
										careerStats.sacFlies,
									)}
								/>

								<StatCard
									label="Stars Used"
									value={formatNullableStat(
										careerStats.starsUsedBatting,
									)}
								/>
							</StatGroup>

							<StatGroup
								title="Plate Discipline"
								description="How the player reaches base"
							>
								<StatCard
									label="Walks"
									value={careerStats.walks}
								/>

								<StatCard
									label="Hit By Pitch"
									value={formatNullableStat(
										careerStats.hitByPitch,
									)}
								/>

								<StatCard
									label="Strikeouts"
									value={careerStats.strikeouts}
								/>

								<StatCard
									label="Plate Appearances"
									value={formatNullableStat(
										careerStats.plateAppearances,
									)}
								/>

								<StatCard
									label="On Base %"
									value={
										careerStats.obp !== null
											? careerStats.obp.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="Slugging %"
									value={
										careerStats.slg !== null
											? careerStats.slg.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="OPS"
									value={
										careerStats.ops !== null
											? careerStats.ops.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>
							</StatGroup>

							<StatGroup
								title="Power"
								description="Extra-base and home run production"
							>
								<StatCard
									label="Singles"
									value={formatNullableStat(
										careerStats.singles,
									)}
								/>

								<StatCard
									label="Doubles"
									value={formatNullableStat(
										careerStats.doubles,
									)}
								/>

								<StatCard
									label="Triples"
									value={formatNullableStat(
										careerStats.triples,
									)}
								/>

								<StatCard
									label="Home Runs"
									value={careerStats.homeRuns}
								/>

								<StatCard
									label="1-Run HR"
									value={formatNullableStat(
										careerStats.oneHr,
									)}
								/>

								<StatCard
									label="2-Run HR"
									value={formatNullableStat(
										careerStats.twoHr,
									)}
								/>

								<StatCard
									label="3-Run HR"
									value={formatNullableStat(
										careerStats.threeHr,
									)}
								/>

								<StatCard
									label="Grand Slams"
									value={formatNullableStat(
										careerStats.grandSlams,
									)}
								/>

								<StatCard
									label="Inside-the-Park HR"
									value={STAT_PLACEHOLDER}
								/>

								<StatCard
									label="Total Bases"
									value={formatNullableStat(
										careerStats.totalBases,
									)}
								/>

								<StatCard
									label="Slugging %"
									value={
										careerStats.slg !== null
											? careerStats.slg.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="OPS"
									value={
										careerStats.ops !== null
											? careerStats.ops.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>
							</StatGroup>

							<StatGroup
								title="Baserunning"
								description="Stolen base and running production"
							>
								<StatCard
									label="Stolen Bases"
									value={formatNullableStat(
										careerStats.stolenBases,
									)}
								/>

								<StatCard
									label="Caught Stealing"
									value={formatNullableStat(
										careerStats.caughtStealing,
									)}
								/>

								<StatCard
									label="Steal Attempts"
									value={formatNullableStat(
										careerStats.stealAttempts,
									)}
								/>
							</StatGroup>
						</TabsContent>

						{/* =================================================
                            FIELDING
                        ================================================= */}

						<TabsContent
							value="fielding"
							className="mt-5 space-y-5"
						>
							<StatGroup
								title="Fielding"
								description="Defensive production and plays made"
							>
								<StatCard
									label="Putouts"
									value={formatNullableStat(
										careerStats.putout,
									)}
								/>

								<StatCard
									label="Assists"
									value={formatNullableStat(
										careerStats.assist,
									)}
								/>

								<StatCard
									label="Double Plays"
									value={formatNullableStat(
										careerStats.doublePlays,
									)}
								/>

								<StatCard
									label="Triple Plays"
									value={formatNullableStat(
										careerStats.triplePlays,
									)}
								/>

								<StatCard
									label="Bobbles"
									value={formatNullableStat(
										careerStats.bobbles,
									)}
								/>

								<StatCard
									label="Fielding Errors"
									value={formatNullableStat(
										careerStats.fieldingErrors,
									)}
								/>

								<StatCard
									label="Stars Used"
									value={formatNullableStat(
										careerStats.starsUsedBatting,
									)}
								/>
							</StatGroup>

							<StatGroup
								title="Buddy Jump"
								description="Buddy jump defensive attempts and results"
							>
								<StatCard
									label="Buddy Jump Putouts"
									value={formatNullableStat(
										careerStats.buddyJumpPutouts,
									)}
								/>

								<StatCard
									label="Buddy Jump Attempts"
									value={formatNullableStat(
										careerStats.buddyJumpAttempts,
									)}
								/>
							</StatGroup>

							<StatGroup
								title="Defensive Plays"
								description="Additional defensive activity"
							>
								<StatCard
									label="Putouts"
									value={formatNullableStat(
										careerStats.putout,
									)}
								/>

								<StatCard
									label="Assists"
									value={formatNullableStat(
										careerStats.assist,
									)}
								/>

								<StatCard
									label="Double Plays"
									value={formatNullableStat(
										careerStats.doublePlays,
									)}
								/>

								<StatCard
									label="Triple Plays"
									value={formatNullableStat(
										careerStats.triplePlays,
									)}
								/>

								<StatCard
									label="Bobbles"
									value={formatNullableStat(
										careerStats.bobbles,
									)}
								/>

								<StatCard
									label="Errors"
									value={formatNullableStat(
										careerStats.fieldingErrors,
									)}
								/>
							</StatGroup>
						</TabsContent>

						{/* =================================================
                            PITCHING
                        ================================================= */}

						<TabsContent
							value="pitching"
							className="mt-5 space-y-5"
						>
							<StatGroup
								title="Pitching"
								description="Overall pitching production"
							>
								<StatCard
									label="ERA"
									value={formatEra(careerStats.era)}
								/>

								<StatCard
									label="IP"
									value={careerStats.inningsPitched}
								/>

								<StatCard
									label="Runs Allowed"
									value={careerStats.runsAllowed}
								/>

								<StatCard
									label="Batters Faced"
									value={formatNullableStat(
										careerStats.battersFaced,
									)}
								/>

								<StatCard
									label="Pitches"
									value={formatNullableStat(
										careerStats.pitches,
									)}
								/>

								<StatCard
									label="Strikes"
									value={formatNullableStat(
										careerStats.strikes,
									)}
								/>

								<StatCard
									label="Balls"
									value={formatNullableStat(
										careerStats.balls,
									)}
								/>

								<StatCard
									label="Strikeouts"
									value={careerStats.strikeouts}
								/>

								<StatCard
									label="Walks"
									value={careerStats.walks}
								/>

								<StatCard
									label="Bean Balls"
									value={formatNullableStat(
										careerStats.beanBalls,
									)}
								/>

								<StatCard
									label="Hits Allowed"
									value={formatNullableStat(
										careerStats.hitsAllowed,
									)}
								/>

								<StatCard
									label="Earned Runs"
									value={STAT_PLACEHOLDER}
								/>

								<StatCard
									label="Inherited Runs"
									value={formatNullableStat(
										careerStats.inheritedRuns,
									)}
								/>

								<StatCard
									label="Star Pitches"
									value={formatNullableStat(
										careerStats.starPitches,
									)}
								/>

								<StatCard
									label="Stars Used"
									value={formatNullableStat(
										careerStats.starsUsedPitching,
									)}
								/>

								<StatCard
									label="Pickoffs"
									value={formatNullableStat(
										careerStats.pickoffs,
									)}
								/>

								<StatCard
									label="Pickoff Attempts"
									value={formatNullableStat(
										careerStats.pickoffAttempts,
									)}
								/>
							</StatGroup>

							<StatGroup
								title="Hits Allowed"
								description="Breakdown of opposing offensive production"
							>
								<StatCard
									label="Singles Allowed"
									value={formatNullableStat(
										careerStats.singlesAllowed,
									)}
								/>

								<StatCard
									label="Doubles Allowed"
									value={formatNullableStat(
										careerStats.doublesAllowed,
									)}
								/>

								<StatCard
									label="Triples Allowed"
									value={formatNullableStat(
										careerStats.triplesAllowed,
									)}
								/>

								<StatCard
									label="HR Allowed"
									value={formatNullableStat(
										careerStats.homeRunsAllowed,
									)}
								/>

								<StatCard
									label="Hits Allowed"
									value={formatNullableStat(
										careerStats.hitsAllowed,
									)}
								/>

								<StatCard
									label="Runs Allowed"
									value={careerStats.runsAllowed}
								/>

								<StatCard
									label="Earned Runs"
									value={STAT_PLACEHOLDER}
								/>
							</StatGroup>

							<StatGroup
								title="Advanced Pitching"
								description="Opponent rate statistics"
							>
								<StatCard
									label="WHIP"
									value={
										careerStats.whip !== null
											? careerStats.whip.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="BA Against"
									value={
										careerStats.baa !== null
											? careerStats.baa.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="OB% Against"
									value={
										careerStats.obpAgainst !== null
											? careerStats.obpAgainst.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="SLG Against"
									value={
										careerStats.slgAgainst !== null
											? careerStats.slgAgainst.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="OPS Against"
									value={
										careerStats.opsAgainst !== null
											? careerStats.opsAgainst.toFixed(3)
											: STAT_PLACEHOLDER
									}
								/>

								<StatCard
									label="ERA"
									value={formatEra(careerStats.era)}
								/>
							</StatGroup>
						</TabsContent>
					</Tabs>
				</section>

				{/* =================================================
                    SEASON BY SEASON
                ================================================= */}

				<section className="mt-10">
					<div className="mb-4">
						<h2 className="text-xl font-black text-slate-900">
							Season Statistics
						</h2>

						<p className="mt-1 text-sm text-slate-500">
							Year-by-year performance
						</p>
					</div>

					<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
						{isLoading ? (
							<SeasonTableSkeleton />
						) : playedSeasons.length === 0 ? (
							<div className="flex min-h-48 items-center justify-center px-6 text-center">
								<div>
									<BarChart3 className="mx-auto h-10 w-10 text-slate-300" />

									<p className="mt-3 font-semibold text-slate-700">
										No career statistics available
									</p>

									<p className="mt-1 text-sm text-slate-400">
										Season statistics will appear here when
										available.
									</p>
								</div>
							</div>
						) : (
							<SeasonTable seasons={playedSeasons} />
						)}
					</div>
				</section>

				{/* =================================================
                    ADDITIONAL PLAYER INFORMATION
                ================================================= */}

				<section className="mt-10">
					<div className="mb-4">
						<h2 className="text-xl font-black text-slate-900">
							Player Details
						</h2>

						<p className="mt-1 text-sm text-slate-500">
							Additional information and player history
						</p>
					</div>

					<Tabs defaultValue="games" className="w-full">
						<TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1 md:grid-cols-4">
							<TabsTrigger
								value="games"
								className="gap-2 rounded-lg py-2.5 text-xs sm:text-sm"
							>
								<CalendarDays className="hidden h-4 w-4 sm:block" />
								Game Log
							</TabsTrigger>

							<TabsTrigger
								value="career"
								className="hidden gap-2 rounded-lg py-2.5 sm:flex sm:text-sm"
							>
								<Trophy className="h-4 w-4" />
								Career
							</TabsTrigger>

							<TabsTrigger
								value="history"
								className="gap-2 rounded-lg py-2.5 text-xs sm:text-sm"
							>
								<History className="hidden h-4 w-4 sm:block" />
								History
							</TabsTrigger>

							<TabsTrigger
								value="awards"
								className="gap-2 rounded-lg py-2.5 text-xs sm:text-sm"
							>
								<Award className="hidden h-4 w-4 sm:block" />
								Awards
							</TabsTrigger>
						</TabsList>

						<div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
							<TabsContent value="games" className="mt-0">
								<AdvancedGameLog player={player.id} />
							</TabsContent>
							<TabsContent value="career" className="mt-0">
								<AdvancedCareerTab player={player.id} />
							</TabsContent>
							<TabsContent value="history" className="mt-0">
								<PlayerHistory player={player.id} />
							</TabsContent>

							<TabsContent value="awards" className="mt-0">
								<PlayerAwards player={player.id} />
							</TabsContent>
						</div>
					</Tabs>
				</section>

				{/* =================================================
                    BACK TO PLAYERS
                ================================================= */}

				<div className="mt-10 flex justify-center">
					<Link
						href="/players"
						className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 hover:shadow-md"
					>
						<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
						Back to All Players
						<ChevronRight className="h-4 w-4 text-slate-400" />
					</Link>
				</div>
			</main>
		</div>
	);
}

/* =========================================================
   RATING
========================================================= */

function Rating({
	label,
	value,
	icon,
}: {
	label: string;
	value: number;
	icon: string;
}) {
	return (
		<div>
			<div className="mb-1.5 flex items-center gap-2">
				<img src={icon} alt="" className="h-5 w-5 object-contain" />

				<span className="flex-1 text-xs font-semibold">{label}</span>

				<span className="text-sm font-black">{value}</span>
			</div>

			<Progress
				value={value * 10}
				max={100}
				className="h-1.5 bg-white/20"
			/>
		</div>
	);
}

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
}) {
	return (
		<div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-[10px] font-bold tracking-widest text-slate-400">
					{label}
				</span>

				<div className="text-slate-400 transition group-hover:text-slate-700">
					{icon}
				</div>
			</div>

			<p
				className={`text-2xl font-black tracking-tight ${
					value === STAT_PLACEHOLDER
						? "text-slate-300"
						: "text-slate-900"
				}`}
			>
				{value}
			</p>
		</div>
	);
}

/* =========================================================
   STAT GROUP
========================================================= */

function StatGroup({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div className="border-b border-slate-100 px-5 py-4">
				<h3 className="font-black text-slate-900">{title}</h3>

				{description && (
					<p className="mt-1 text-xs text-slate-400">{description}</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
				{children}
			</div>
		</section>
	);
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
	label,
	value = STAT_PLACEHOLDER,
}: {
	label: string;
	value?: string | number;
}) {
	return (
		<div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white">
			<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
				{label}
			</p>

			<p
				className={`mt-1 text-xl font-black ${
					value === STAT_PLACEHOLDER
						? "text-slate-300"
						: "text-slate-900"
				}`}
			>
				{value}
			</p>
		</div>
	);
}

/* =========================================================
   SEASON TABLE
========================================================= */

function SeasonTable({ seasons }: { seasons: CareerStatsDto[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[760px] text-left">
				<thead>
					<tr className="border-b border-slate-200 bg-slate-50">
						<th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
							Season
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							AVG
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							AB
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							H
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							HR
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							RBI
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							R
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							ERA
						</th>

						<th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
							IP
						</th>
					</tr>
				</thead>

				<tbody>
					{seasons.map((season, index) => {
						const average =
							season.atBats > 0 ? season.hits / season.atBats : 0;

						const seasonNumber = season.seasonId ?? index + 1;

						return (
							<tr
								key={`${seasonNumber}-${index}`}
								className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
							>
								<td className="px-5 py-4">
									<span className="font-bold text-slate-900">
										{seasonNumber}
									</span>
								</td>

								<td className="px-5 py-4 text-right font-semibold text-slate-700">
									{formatAverage(average)}
								</td>

								<td className="px-5 py-4 text-right text-slate-600">
									{season.atBats}
								</td>

								<td className="px-5 py-4 text-right text-slate-600">
									{season.hits}
								</td>

								<td className="px-5 py-4 text-right font-semibold text-slate-700">
									{season.homeRuns}
								</td>

								<td className="px-5 py-4 text-right text-slate-600">
									{season.rbis}
								</td>

								<td className="px-5 py-4 text-right text-slate-600">
									{season.runs}
								</td>

								<td className="px-5 py-4 text-right font-semibold text-slate-700">
									{formatEra(season.era)}
								</td>

								<td className="px-5 py-4 text-right text-slate-600">
									{season.inningsPitched}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

/* =========================================================
   TABLE SKELETON
========================================================= */

function SeasonTableSkeleton() {
	return (
		<div className="space-y-0">
			{Array.from({
				length: 6,
			}).map((_, index) => (
				<div
					key={index}
					className="flex items-center gap-6 border-b border-slate-100 px-5 py-5 last:border-0"
				>
					<div className="h-4 w-16 animate-pulse rounded bg-slate-200" />

					<div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200" />

					<div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

					<div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

					<div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

					<div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
				</div>
			))}
		</div>
	);
}
