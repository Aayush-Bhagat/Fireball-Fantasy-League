"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
	BarChart3,
	Crosshair,
	Loader2,
	Shield,
	Trophy,
	Zap,
} from "lucide-react";

import { getCareerStats } from "@/requests/players";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerStatsDto } from "@/dtos/playerDtos";

import {
	calculateEra,
	calculateInningsPitched,
	calculateOBP,
	calculateSLG,
	calculateOPS,
	calculateWHIP,
	calculateBAA,
	calculateOBPAgainst,
	calculateSLGAgainst,
	calculateOPSAgainst,
} from "@/lib/statUtils";

/* =========================================================
   TYPES
========================================================= */

type Props = {
	player: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number | null | undefined, decimals = 0): string {
	if (value === null || value === undefined) {
		return "-";
	}

	return value.toFixed(decimals);
}

function formatRate(value: number | null | undefined, decimals = 3): string {
	if (value === null || value === undefined) {
		return "-";
	}

	return value.toFixed(decimals);
}

function formatInteger(value: number | null | undefined): string {
	if (value === null || value === undefined) {
		return "-";
	}

	return value.toString();
}

function formatTeams(teams: string[] | null | undefined): string {
	if (!teams || teams.length === 0) {
		return "-";
	}

	return teams.join(", ");
}

/* =========================================================
   TABLE COMPONENTS
========================================================= */

function TableWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
			<table className="w-full min-w-max text-sm">{children}</table>
		</div>
	);
}

function TableHeader({ children }: { children: React.ReactNode }) {
	return (
		<thead className="border-b border-gray-200 bg-gray-50">
			<tr>{children}</tr>
		</thead>
	);
}

function HeaderCell({ children }: { children: React.ReactNode }) {
	return (
		<th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
			{children}
		</th>
	);
}

function BodyCell({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<td
			className={`whitespace-nowrap px-3 py-3 text-center text-gray-700 ${className}`}
		>
			{children}
		</td>
	);
}

function SeasonCell({ season }: { season: CareerStatsDto }) {
	return (
		<BodyCell className="font-semibold text-gray-900">
			{season.seasonId}
		</BodyCell>
	);
}

function TeamCell({ season }: { season: CareerStatsDto }) {
	return (
		<BodyCell className="min-w-[140px] max-w-[220px]">
			<span title={formatTeams(season.teamsPlayedFor)}>
				{formatTeams(season.teamsPlayedFor)}
			</span>
		</BodyCell>
	);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdvancedCareerTab({ player }: Props) {
	const {
		data: playerCareerStats,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["player-career-stats", player],
		queryFn: async () => {
			const res = await getCareerStats(player);
			return res.careerStats;
		},
	});

	/*
	 * Newest season first.
	 *
	 * A season is considered meaningful if the player had
	 * batting, pitching, baserunning, or fielding activity.
	 */
	const seasons = React.useMemo(() => {
		if (!playerCareerStats) {
			return [];
		}

		return [...playerCareerStats]
			.filter(
				(season) =>
					season.atBats > 0 ||
					season.hits > 0 ||
					season.inningsPitched > 0 ||
					season.runsAllowed > 0 ||
					(season.assist ?? 0) > 0 ||
					(season.fieldingErrors ?? 0) > 0 ||
					(season.stolenBases ?? 0) > 0 ||
					(season.caughtStealing ?? 0) > 0 ||
					(season.stealAttempts ?? 0) > 0,
			)
			.sort((a, b) => b.seasonId - a.seasonId);
	}, [playerCareerStats]);

	const hasBattingStats = seasons.some(
		(season) =>
			season.atBats > 0 ||
			season.hits > 0 ||
			season.runs > 0 ||
			season.rbis > 0 ||
			season.homeRuns > 0,
	);

	const hasBaserunningStats = seasons.some(
		(season) =>
			(season.stolenBases ?? 0) > 0 ||
			(season.caughtStealing ?? 0) > 0 ||
			(season.stealAttempts ?? 0) > 0,
	);

	const hasPitchingStats = seasons.some(
		(season) =>
			season.inningsPitched > 0 ||
			season.outsPitched > 0 ||
			season.runsAllowed > 0 ||
			season.strikeouts > 0 ||
			(season.hitsAllowed ?? 0) > 0,
	);

	const hasFieldingStats = seasons.some(
		(season) =>
			(season.assist ?? 0) > 0 ||
			(season.fieldingErrors ?? 0) > 0 ||
			(season.doublePlays ?? 0) > 0 ||
			(season.triplePlays ?? 0) > 0,
	);

	/* =====================================================
       CAREER COUNTING TOTALS
    ===================================================== */

	const careerTotals = React.useMemo(() => {
		if (seasons.length === 0) {
			return null;
		}

		const totals = {
			/* -------------------------
               Batting
            ------------------------- */

			atBats: 0,
			hits: 0,
			runs: 0,
			rbis: 0,
			walks: 0,
			strikeouts: 0,
			homeRuns: 0,
			plateAppearances: 0,
			strikeoutsBatted: 0,
			hitByPitch: 0,
			singles: 0,
			doubles: 0,
			triples: 0,
			oneHr: 0,
			twoHr: 0,
			threeHr: 0,
			grandSlams: 0,
			totalBases: 0,
			sacFlies: 0,
			startHits: 0,
			starsUsedBatting: 0,

			/* -------------------------
               Baserunning
            ------------------------- */

			stolenBases: 0,
			caughtStealing: 0,
			stealAttempts: 0,

			/* -------------------------
               Fielding
            ------------------------- */

			putout: 0,
			assist: 0,
			fieldingErrors: 0,
			buddyJumpPutouts: 0,
			buddyJumpAttempts: 0,
			doublePlays: 0,
			triplePlays: 0,
			bobbles: 0,

			/* -------------------------
               Pitching
            ------------------------- */

			outsPitched: 0,
			runsAllowed: 0,
			outs: 0,
			battersFaced: 0,
			pitches: 0,
			strikes: 0,
			balls: 0,
			beanBalls: 0,
			hitsAllowed: 0,
			singlesAllowed: 0,
			doublesAllowed: 0,
			triplesAllowed: 0,
			homeRunsAllowed: 0,
			inheritedRuns: 0,
			starPitches: 0,
			starsUsedPitching: 0,
			pickoffs: 0,
			pickoffAttempts: 0,
		};

		for (const season of seasons) {
			/* -------------------------
               Batting
            ------------------------- */

			totals.atBats += season.atBats;
			totals.hits += season.hits;
			totals.runs += season.runs;
			totals.rbis += season.rbis;
			totals.walks += season.walks;
			totals.strikeouts += season.strikeouts;
			totals.homeRuns += season.homeRuns;

			totals.plateAppearances += season.plateAppearances ?? 0;
			totals.strikeoutsBatted += season.strikeoutsBatted ?? 0;
			totals.hitByPitch += season.hitByPitch ?? 0;
			totals.singles += season.singles ?? 0;
			totals.doubles += season.doubles ?? 0;
			totals.triples += season.triples ?? 0;
			totals.oneHr += season.oneHr ?? 0;
			totals.twoHr += season.twoHr ?? 0;
			totals.threeHr += season.threeHr ?? 0;
			totals.grandSlams += season.grandSlams ?? 0;
			totals.totalBases += season.totalBases ?? 0;
			totals.sacFlies += season.sacFlies ?? 0;
			totals.startHits += season.startHits ?? 0;
			totals.starsUsedBatting += season.starsUsedBatting ?? 0;

			/* -------------------------
               Baserunning
            ------------------------- */

			totals.stolenBases += season.stolenBases ?? 0;
			totals.caughtStealing += season.caughtStealing ?? 0;
			totals.stealAttempts += season.stealAttempts ?? 0;

			/* -------------------------
               Fielding
            ------------------------- */

			totals.assist += season.assist ?? 0;
			totals.fieldingErrors += season.fieldingErrors ?? 0;
			totals.buddyJumpPutouts += season.buddyJumpPutouts ?? 0;
			totals.buddyJumpAttempts += season.buddyJumpAttempts ?? 0;
			totals.doublePlays += season.doublePlays ?? 0;
			totals.triplePlays += season.triplePlays ?? 0;
			totals.bobbles += season.bobbles ?? 0;

			/* -------------------------
               Pitching
            ------------------------- */

			/*
			 * Use outsPitched directly rather than adding
			 * decimal innings values.
			 */
			totals.outsPitched += season.outsPitched;

			totals.runsAllowed += season.runsAllowed;
			totals.outs += season.outs;

			totals.battersFaced += season.battersFaced ?? 0;
			totals.pitches += season.pitches ?? 0;
			totals.strikes += season.strikes ?? 0;
			totals.balls += season.balls ?? 0;
			totals.beanBalls += season.beanBalls ?? 0;
			totals.hitsAllowed += season.hitsAllowed ?? 0;
			totals.singlesAllowed += season.singlesAllowed ?? 0;
			totals.doublesAllowed += season.doublesAllowed ?? 0;
			totals.triplesAllowed += season.triplesAllowed ?? 0;
			totals.homeRunsAllowed += season.homeRunsAllowed ?? 0;
			totals.inheritedRuns += season.inheritedRuns ?? 0;
			totals.starPitches += season.starPitches ?? 0;
			totals.starsUsedPitching += season.starsUsedPitching ?? 0;
			totals.pickoffs += season.pickoffs ?? 0;
			totals.pickoffAttempts += season.pickoffAttempts ?? 0;
		}

		return totals;
	}, [seasons]);

	/* =====================================================
       CAREER BATTING CALCULATIONS
    ===================================================== */

	const careerAVG =
		careerTotals && careerTotals.atBats > 0
			? Number((careerTotals.hits / careerTotals.atBats).toFixed(3))
			: null;

	const careerOBP = careerTotals
		? calculateOBP(
				careerTotals.hits,
				careerTotals.walks,
				careerTotals.hitByPitch,
				careerTotals.atBats,
				careerTotals.sacFlies,
			)
		: null;

	const careerSLG = careerTotals
		? calculateSLG(
				careerTotals.hits,
				careerTotals.singles,
				careerTotals.doubles,
				careerTotals.triples,
				careerTotals.homeRuns,
				careerTotals.atBats,
			)
		: null;

	const careerOPS = calculateOPS(careerOBP, careerSLG);

	/* =====================================================
       CAREER PITCHING CALCULATIONS
    ===================================================== */

	/*
	 * This is the actual total number of pitching outs.
	 *
	 * We use outsPitched directly because it is the source
	 * value used by the stat utilities.
	 */
	const careerOutsPitched = careerTotals?.outsPitched ?? 0;

	const careerIP = calculateInningsPitched(careerOutsPitched);

	const careerERA = careerTotals
		? calculateEra(careerTotals.runsAllowed, careerTotals.outsPitched)
		: 0;

	const careerWHIP = careerTotals
		? calculateWHIP(
				careerTotals.walks,
				careerTotals.hitsAllowed,
				careerTotals.outsPitched,
			)
		: null;

	/*
	 * =====================================================
	 * AT BATS AGAINST
	 * =====================================================
	 *
	 * Your DTO does not contain a direct atBatsAgainst field.
	 *
	 * Batters Faced consists of:
	 *
	 *     AB Against
	 *     + Walks
	 *     + Bean Balls
	 *
	 * Therefore:
	 *
	 *     AB Against = BF - BB - HBP
	 *
	 * This is then used for BAA, OBP-A and SLG-A.
	 */

	const careerAtBatsAgainst =
		careerTotals && careerTotals.battersFaced > 0
			? Math.max(
					0,
					careerTotals.battersFaced -
						careerTotals.walks -
						careerTotals.beanBalls,
				)
			: 0;

	const careerBAA = careerTotals
		? calculateBAA(careerTotals.hitsAllowed, careerAtBatsAgainst)
		: null;

	const careerOBPAgainst = careerTotals
		? calculateOBPAgainst(
				careerTotals.hitsAllowed,
				careerTotals.walks,
				careerAtBatsAgainst,
				careerTotals.beanBalls,
			)
		: null;

	const careerSLGAgainst = careerTotals
		? calculateSLGAgainst(
				careerTotals.hitsAllowed,
				careerTotals.singlesAllowed,
				careerTotals.doublesAllowed,
				careerTotals.triplesAllowed,
				careerTotals.homeRunsAllowed,
				careerAtBatsAgainst,
			)
		: null;

	const careerOPSAgainst = calculateOPSAgainst(
		careerOBPAgainst,
		careerSLGAgainst,
	);

	/* =====================================================
       LOADING
    ===================================================== */

	if (isLoading) {
		return (
			<div className="flex min-h-[300px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	/* =====================================================
       ERROR
    ===================================================== */

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<p className="font-medium text-red-700">
					Failed to load career statistics.
				</p>
			</div>
		);
	}

	/* =====================================================
       EMPTY
    ===================================================== */

	if (seasons.length === 0) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
				<BarChart3 className="mx-auto mb-3 h-8 w-8 text-gray-400" />
				<p className="font-medium text-gray-700">
					No career statistics available.
				</p>
			</div>
		);
	}

	/* =====================================================
       RENDER
    ===================================================== */

	return (
		<div className="w-full">
			<Tabs defaultValue="batting" className="w-full">
				{/* =================================================
                    TAB NAVIGATION
                ================================================= */}

				<div className="mb-4 overflow-x-auto">
					<TabsList className="inline-flex min-w-max">
						{hasBattingStats && (
							<TabsTrigger value="batting" className="gap-2">
								<Trophy className="h-4 w-4" />
								Batting
							</TabsTrigger>
						)}

						{hasBaserunningStats && (
							<TabsTrigger value="baserunning" className="gap-2">
								<Zap className="h-4 w-4" />
								Baserunning
							</TabsTrigger>
						)}

						{hasPitchingStats && (
							<TabsTrigger value="pitching" className="gap-2">
								<Crosshair className="h-4 w-4" />
								Pitching
							</TabsTrigger>
						)}

						{hasFieldingStats && (
							<TabsTrigger value="fielding" className="gap-2">
								<Shield className="h-4 w-4" />
								Fielding
							</TabsTrigger>
						)}
					</TabsList>
				</div>

				{/* =================================================
                    BATTING
                ================================================= */}

				{hasBattingStats && (
					<TabsContent value="batting" className="mt-0">
						<div className="mb-3 flex items-center gap-2">
							<Trophy className="h-5 w-5 text-gray-600" />
							<h3 className="font-semibold text-gray-900">
								Career Batting by Season
							</h3>
						</div>

						<TableWrapper>
							<TableHeader>
								<HeaderCell>Season</HeaderCell>
								<HeaderCell>Team</HeaderCell>
								<HeaderCell>AB</HeaderCell>
								<HeaderCell>H</HeaderCell>
								<HeaderCell>R</HeaderCell>
								<HeaderCell>RBI</HeaderCell>
								<HeaderCell>BB</HeaderCell>
								<HeaderCell>SO</HeaderCell>
								<HeaderCell>HR</HeaderCell>
								<HeaderCell>PA</HeaderCell>
								<HeaderCell>HBP</HeaderCell>
								<HeaderCell>SF</HeaderCell>
								<HeaderCell>1B</HeaderCell>
								<HeaderCell>2B</HeaderCell>
								<HeaderCell>3B</HeaderCell>
								<HeaderCell>1HR</HeaderCell>
								<HeaderCell>2HR</HeaderCell>
								<HeaderCell>3HR</HeaderCell>
								<HeaderCell>GS</HeaderCell>
								<HeaderCell>TB</HeaderCell>
								<HeaderCell>AVG</HeaderCell>
								<HeaderCell>OBP</HeaderCell>
								<HeaderCell>SLG</HeaderCell>
								<HeaderCell>OPS</HeaderCell>
								<HeaderCell>SO-B</HeaderCell>
								<HeaderCell>Star Hits</HeaderCell>
								<HeaderCell>Star Use</HeaderCell>
							</TableHeader>

							<tbody>
								{seasons.map((season) => (
									<tr
										key={season.seasonId}
										className="border-b border-gray-100 transition-colors hover:bg-gray-50"
									>
										<SeasonCell season={season} />
										<TeamCell season={season} />

										<BodyCell>
											{formatInteger(season.atBats)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.hits)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.runs)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.rbis)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.walks)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.strikeouts)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.homeRuns)}
										</BodyCell>
										<BodyCell>
											{formatInteger(
												season.plateAppearances,
											)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.hitByPitch)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.sacFlies)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.singles)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.doubles)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.triples)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.oneHr)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.twoHr)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.threeHr)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.grandSlams)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.totalBases)}
										</BodyCell>
										<BodyCell>
											{formatRate(season.battingAverage)}
										</BodyCell>
										<BodyCell>
											{formatRate(season.obp)}
										</BodyCell>
										<BodyCell>
											{formatRate(season.slg)}
										</BodyCell>
										<BodyCell>
											{formatRate(season.ops)}
										</BodyCell>
										<BodyCell>
											{formatInteger(
												season.strikeoutsBatted,
											)}
										</BodyCell>
										<BodyCell>
											{formatInteger(season.startHits)}
										</BodyCell>
										<BodyCell>
											{formatInteger(
												season.starsUsedBatting,
											)}
										</BodyCell>
									</tr>
								))}

								{careerTotals && (
									<tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
										<BodyCell>Total</BodyCell>
										<BodyCell>—</BodyCell>
										<BodyCell>
											{careerTotals.atBats}
										</BodyCell>
										<BodyCell>{careerTotals.hits}</BodyCell>
										<BodyCell>{careerTotals.runs}</BodyCell>
										<BodyCell>{careerTotals.rbis}</BodyCell>
										<BodyCell>
											{careerTotals.walks}
										</BodyCell>
										<BodyCell>
											{careerTotals.strikeouts}
										</BodyCell>
										<BodyCell>
											{careerTotals.homeRuns}
										</BodyCell>
										<BodyCell>
											{careerTotals.plateAppearances}
										</BodyCell>
										<BodyCell>
											{careerTotals.hitByPitch}
										</BodyCell>
										<BodyCell>
											{careerTotals.sacFlies}
										</BodyCell>
										<BodyCell>
											{careerTotals.singles}
										</BodyCell>
										<BodyCell>
											{careerTotals.doubles}
										</BodyCell>
										<BodyCell>
											{careerTotals.triples}
										</BodyCell>
										<BodyCell>
											{careerTotals.oneHr}
										</BodyCell>
										<BodyCell>
											{careerTotals.twoHr}
										</BodyCell>
										<BodyCell>
											{careerTotals.threeHr}
										</BodyCell>
										<BodyCell>
											{careerTotals.grandSlams}
										</BodyCell>
										<BodyCell>
											{careerTotals.totalBases}
										</BodyCell>
										<BodyCell>
											{formatRate(careerAVG)}
										</BodyCell>
										<BodyCell>
											{formatRate(careerOBP)}
										</BodyCell>
										<BodyCell>
											{formatRate(careerSLG)}
										</BodyCell>
										<BodyCell>
											{formatRate(careerOPS)}
										</BodyCell>
										<BodyCell>
											{careerTotals.strikeoutsBatted}
										</BodyCell>
										<BodyCell>
											{careerTotals.startHits}
										</BodyCell>
										<BodyCell>
											{careerTotals.starsUsedBatting}
										</BodyCell>
									</tr>
								)}
							</tbody>
						</TableWrapper>
					</TabsContent>
				)}

				{/* =================================================
                    BASERUNNING
                ================================================= */}

				{hasBaserunningStats && (
					<TabsContent value="baserunning" className="mt-0">
						<div className="mb-3 flex items-center gap-2">
							<Zap className="h-5 w-5 text-gray-600" />
							<h3 className="font-semibold text-gray-900">
								Career Baserunning by Season
							</h3>
						</div>

						<TableWrapper>
							<TableHeader>
								<HeaderCell>Season</HeaderCell>
								<HeaderCell>Team</HeaderCell>
								<HeaderCell>SB</HeaderCell>
								<HeaderCell>CS</HeaderCell>
								<HeaderCell>ATT</HeaderCell>
								<HeaderCell>SB%</HeaderCell>
							</TableHeader>

							<tbody>
								{seasons.map((season) => {
									const attempts = season.stealAttempts ?? 0;

									const stolenBases = season.stolenBases ?? 0;

									const sbPercentage =
										attempts > 0
											? stolenBases / attempts
											: null;

									return (
										<tr
											key={season.seasonId}
											className="border-b border-gray-100 hover:bg-gray-50"
										>
											<SeasonCell season={season} />
											<TeamCell season={season} />

											<BodyCell>
												{formatInteger(
													season.stolenBases,
												)}
											</BodyCell>

											<BodyCell>
												{formatInteger(
													season.caughtStealing,
												)}
											</BodyCell>

											<BodyCell>
												{formatInteger(
													season.stealAttempts,
												)}
											</BodyCell>

											<BodyCell>
												{sbPercentage !== null
													? `${(
															sbPercentage * 100
														).toFixed(1)}%`
													: "-"}
											</BodyCell>
										</tr>
									);
								})}

								{careerTotals && (
									<tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
										<BodyCell>Total</BodyCell>
										<BodyCell>—</BodyCell>

										<BodyCell>
											{careerTotals.stolenBases}
										</BodyCell>

										<BodyCell>
											{careerTotals.caughtStealing}
										</BodyCell>

										<BodyCell>
											{careerTotals.stealAttempts}
										</BodyCell>

										<BodyCell>
											{careerTotals.stealAttempts > 0
												? `${(
														(careerTotals.stolenBases /
															careerTotals.stealAttempts) *
														100
													).toFixed(1)}%`
												: "-"}
										</BodyCell>
									</tr>
								)}
							</tbody>
						</TableWrapper>
					</TabsContent>
				)}

				{/* =================================================
                    PITCHING
                ================================================= */}

				{hasPitchingStats && (
					<TabsContent value="pitching" className="mt-0">
						<div className="mb-3 flex items-center gap-2">
							<Crosshair className="h-5 w-5 text-gray-600" />
							<h3 className="font-semibold text-gray-900">
								Career Pitching by Season
							</h3>
						</div>

						<TableWrapper>
							<TableHeader>
								<HeaderCell>Season</HeaderCell>
								<HeaderCell>Team</HeaderCell>
								<HeaderCell>IP</HeaderCell>
								<HeaderCell>OUTS</HeaderCell>
								<HeaderCell>BF</HeaderCell>
								<HeaderCell>RA</HeaderCell>
								<HeaderCell>H</HeaderCell>
								<HeaderCell>1B</HeaderCell>
								<HeaderCell>2B</HeaderCell>
								<HeaderCell>3B</HeaderCell>
								<HeaderCell>HR</HeaderCell>
								<HeaderCell>BB</HeaderCell>
								<HeaderCell>HBP</HeaderCell>
								<HeaderCell>SO</HeaderCell>
								<HeaderCell>P</HeaderCell>
								<HeaderCell>S</HeaderCell>
								<HeaderCell>B</HeaderCell>
								<HeaderCell>ERA</HeaderCell>
								<HeaderCell>WHIP</HeaderCell>
								<HeaderCell>BAA</HeaderCell>
								<HeaderCell>OBP-A</HeaderCell>
								<HeaderCell>SLG-A</HeaderCell>
								<HeaderCell>OPS-A</HeaderCell>
								<HeaderCell>PK</HeaderCell>
								<HeaderCell>PK ATT</HeaderCell>
								<HeaderCell>IR</HeaderCell>
								<HeaderCell>Star Pitches</HeaderCell>
								<HeaderCell>Star Use</HeaderCell>
							</TableHeader>

							<tbody>
								{seasons.map((season) => (
									<tr
										key={season.seasonId}
										className="border-b border-gray-100 hover:bg-gray-50"
									>
										<SeasonCell season={season} />
										<TeamCell season={season} />

										<BodyCell>
											{formatNumber(
												season.inningsPitched,
												1,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.outsPitched)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.battersFaced)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.runsAllowed)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.hitsAllowed)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.singlesAllowed,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.doublesAllowed,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.triplesAllowed,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.homeRunsAllowed,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.walks)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.beanBalls)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.strikeouts)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.pitches)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.strikes)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.balls)}
										</BodyCell>

										<BodyCell>
											{formatNumber(season.era, 2)}
										</BodyCell>

										<BodyCell>
											{formatRate(season.whip)}
										</BodyCell>

										<BodyCell>
											{formatRate(season.baa)}
										</BodyCell>

										<BodyCell>
											{formatRate(season.obpAgainst)}
										</BodyCell>

										<BodyCell>
											{formatRate(season.slgAgainst)}
										</BodyCell>

										<BodyCell>
											{formatRate(season.opsAgainst)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.pickoffs)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.pickoffAttempts,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.inheritedRuns,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.starPitches)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.starsUsedPitching,
											)}
										</BodyCell>
									</tr>
								))}

								{careerTotals && (
									<tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
										<BodyCell>Total</BodyCell>
										<BodyCell>—</BodyCell>

										<BodyCell>
											{formatNumber(careerIP, 1)}
										</BodyCell>

										<BodyCell>{careerOutsPitched}</BodyCell>

										<BodyCell>
											{careerTotals.battersFaced}
										</BodyCell>

										<BodyCell>
											{careerTotals.runsAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.hitsAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.singlesAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.doublesAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.triplesAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.homeRunsAllowed}
										</BodyCell>

										<BodyCell>
											{careerTotals.walks}
										</BodyCell>

										<BodyCell>
											{careerTotals.beanBalls}
										</BodyCell>

										<BodyCell>
											{careerTotals.strikeouts}
										</BodyCell>

										<BodyCell>
											{careerTotals.pitches}
										</BodyCell>

										<BodyCell>
											{careerTotals.strikes}
										</BodyCell>

										<BodyCell>
											{careerTotals.balls}
										</BodyCell>

										<BodyCell>
											{formatNumber(careerERA, 2)}
										</BodyCell>

										<BodyCell>
											{formatRate(careerWHIP)}
										</BodyCell>

										<BodyCell>
											{formatRate(careerBAA)}
										</BodyCell>

										<BodyCell>
											{formatRate(careerOBPAgainst)}
										</BodyCell>

										<BodyCell>
											{formatRate(careerSLGAgainst)}
										</BodyCell>

										<BodyCell>
											{formatRate(careerOPSAgainst)}
										</BodyCell>

										<BodyCell>
											{careerTotals.pickoffs}
										</BodyCell>

										<BodyCell>
											{careerTotals.pickoffAttempts}
										</BodyCell>

										<BodyCell>
											{careerTotals.inheritedRuns}
										</BodyCell>

										<BodyCell>
											{careerTotals.starPitches}
										</BodyCell>

										<BodyCell>
											{careerTotals.starsUsedPitching}
										</BodyCell>
									</tr>
								)}
							</tbody>
						</TableWrapper>
					</TabsContent>
				)}

				{/* =================================================
                    FIELDING
                ================================================= */}

				{hasFieldingStats && (
					<TabsContent value="fielding" className="mt-0">
						<div className="mb-3 flex items-center gap-2">
							<Shield className="h-5 w-5 text-gray-600" />
							<h3 className="font-semibold text-gray-900">
								Career Fielding by Season
							</h3>
						</div>

						<TableWrapper>
							<TableHeader>
								<HeaderCell>Season</HeaderCell>
								<HeaderCell>Team</HeaderCell>
								<HeaderCell>PO</HeaderCell>
								<HeaderCell>A</HeaderCell>
								<HeaderCell>E</HeaderCell>
								<HeaderCell>DP</HeaderCell>
								<HeaderCell>TP</HeaderCell>
								<HeaderCell>BOB</HeaderCell>
								<HeaderCell>BJ PO</HeaderCell>
								<HeaderCell>BJ ATT</HeaderCell>
							</TableHeader>

							<tbody>
								{seasons.map((season) => (
									<tr
										key={season.seasonId}
										className="border-b border-gray-100 hover:bg-gray-50"
									>
										<SeasonCell season={season} />
										<TeamCell season={season} />

										<BodyCell>
											{formatInteger(season.outs)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.assist)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.fieldingErrors,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.doublePlays)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.triplePlays)}
										</BodyCell>

										<BodyCell>
											{formatInteger(season.bobbles)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.buddyJumpPutouts,
											)}
										</BodyCell>

										<BodyCell>
											{formatInteger(
												season.buddyJumpAttempts,
											)}
										</BodyCell>
									</tr>
								))}

								{careerTotals && (
									<tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
										<BodyCell>Total</BodyCell>
										<BodyCell>—</BodyCell>

										<BodyCell>
											{careerTotals.putout}
										</BodyCell>

										<BodyCell>
											{careerTotals.assist}
										</BodyCell>

										<BodyCell>
											{careerTotals.fieldingErrors}
										</BodyCell>

										<BodyCell>
											{careerTotals.doublePlays}
										</BodyCell>

										<BodyCell>
											{careerTotals.triplePlays}
										</BodyCell>

										<BodyCell>
											{careerTotals.bobbles}
										</BodyCell>

										<BodyCell>
											{careerTotals.buddyJumpPutouts}
										</BodyCell>

										<BodyCell>
											{careerTotals.buddyJumpAttempts}
										</BodyCell>
									</tr>
								)}
							</tbody>
						</TableWrapper>
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
