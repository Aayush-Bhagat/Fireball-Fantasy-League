"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { format } from "date-fns";

import { Loader2 } from "lucide-react";

import { getPlayerGameLogs } from "@/requests/players";

import { getAllSeasons } from "@/requests/season";

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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

type Props = {
	player: string;
};

const STAT_PLACEHOLDER = "-";

function formatNumber(value: number | null | undefined, decimals = 0): string {
	if (value === null || value === undefined) {
		return STAT_PLACEHOLDER;
	}

	return value.toFixed(decimals);
}

function formatRate(value: number | null | undefined, decimals = 3): string {
	if (value === null || value === undefined) {
		return STAT_PLACEHOLDER;
	}

	return value.toFixed(decimals);
}

/*
 * ============================================================
 * AT-BATS AGAINST
 * ============================================================
 *
 * The DTO does not contain a direct atBatsAgainst field.
 *
 * We derive it from:
 *
 * BF - BB - HBP
 *
 * because walks and hit-by-pitches are not at-bats.
 */
function getAtBatsAgainst(stats: {
	battersFaced: number | null;
	walks: number;
	beanBalls: number | null;
}): number | null {
	if (stats.battersFaced === null || stats.beanBalls === null) {
		return null;
	}

	return Math.max(0, stats.battersFaced - stats.walks - stats.beanBalls);
}

export default function AdvancedGameLog({ player }: Props) {
	const [selectedSeason, setSelectedSeason] = useState<string | undefined>(
		undefined,
	);

	/*
	 * ============================================================
	 * GAME LOG QUERY
	 * ============================================================
	 */
	const { data: playerGameLogs, isLoading: isGameLogsLoading } = useQuery({
		queryKey: ["advanced-player-game-logs", player, selectedSeason],
		queryFn: async () => {
			const res = await getPlayerGameLogs(player, selectedSeason);

			return res.games;
		},
		enabled: !!player,
	});

	/*
	 * ============================================================
	 * SEASONS QUERY
	 * ============================================================
	 */
	const { data: seasons, isLoading: isSeasonsLoading } = useQuery({
		queryKey: ["seasons"],
		queryFn: async () => {
			const res = await getAllSeasons();

			return res.seasons.filter(
				(season) =>
					season.status === "in_progress" ||
					season.status === "completed",
			);
		},
	});

	/*
	 * ============================================================
	 * DEFAULT SEASON
	 * ============================================================
	 */
	useEffect(() => {
		if (selectedSeason === undefined && seasons && seasons.length > 0) {
			setSelectedSeason(seasons[0].id.toString());
		}
	}, [seasons, selectedSeason]);

	/*
	 * ============================================================
	 * SORT GAMES
	 * ============================================================
	 */
	const sortedGames = useMemo(() => {
		if (!playerGameLogs) {
			return [];
		}

		return [...playerGameLogs].sort((a, b) => {
			const dateA = a.playedAt ? new Date(a.playedAt).getTime() : 0;

			const dateB = b.playedAt ? new Date(b.playedAt).getTime() : 0;

			return dateB - dateA;
		});
	}, [playerGameLogs]);

	/*
	 * ============================================================
	 * AVAILABLE TABS
	 * ============================================================
	 *
	 * These determine whether the tabs themselves are shown.
	 *
	 * IMPORTANT:
	 * We do NOT filter individual games based on these values.
	 *
	 * Every game remains in every available tab.
	 */
	const hasPitchingStats = useMemo(() => {
		return sortedGames.some(
			(game) =>
				game.stats.outsPitched > 0 ||
				game.stats.runsAllowed > 0 ||
				game.stats.walks > 0 ||
				game.stats.strikeouts > 0 ||
				game.stats.hitsAllowed !== null ||
				game.stats.battersFaced !== null ||
				game.stats.pitches !== null ||
				game.stats.strikes !== null ||
				game.stats.balls !== null ||
				game.stats.beanBalls !== null ||
				game.stats.pickoffs !== null ||
				game.stats.pickoffAttempts !== null ||
				game.stats.inheritedRuns !== null ||
				game.stats.starPitches !== null ||
				game.stats.starsUsedPitching !== null ||
				game.stats.outs > 0,
		);
	}, [sortedGames]);

	const hasFieldingStats = useMemo(() => {
		return sortedGames.some(
			(game) =>
				game.stats.assist !== null ||
				game.stats.fieldingErrors !== null ||
				game.stats.doublePlays !== null ||
				game.stats.triplePlays !== null ||
				game.stats.bobbles !== null ||
				game.stats.buddyJumpPutouts !== null ||
				game.stats.buddyJumpAttempts !== null,
		);
	}, [sortedGames]);

	const isLoading = isGameLogsLoading || isSeasonsLoading;

	/*
	 * ============================================================
	 * RENDER
	 * ============================================================
	 */
	return (
		<div className="w-full">
			<Tabs defaultValue="bat" className="w-full">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<TabsList>
						<TabsTrigger value="bat">Batting</TabsTrigger>

						{hasPitchingStats && (
							<TabsTrigger value="pitch">Pitching</TabsTrigger>
						)}

						{hasFieldingStats && (
							<TabsTrigger value="field">Fielding</TabsTrigger>
						)}
					</TabsList>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Season {selectedSeason ?? "-"}
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Select Season</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuRadioGroup
								value={selectedSeason}
								onValueChange={setSelectedSeason}
							>
								{seasons?.map((season) => (
									<DropdownMenuRadioItem
										key={season.id}
										value={season.id.toString()}
									>
										Season {season.id}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<h2 className="mt-4 mb-2 text-lg font-semibold">
					Advanced Game Log
				</h2>

				{/* =====================================================
                    BATTING
                ====================================================== */}
				<TabsContent value="bat">
					<div className="overflow-x-auto rounded-lg">
						<table className="w-full min-w-[1900px] bg-white border border-gray-100 shadow text-sm">
							<thead className="bg-purple-600 text-white">
								<tr>
									<th className="p-2">Date</th>
									<th className="p-2">Opp</th>
									<th className="p-2">AB</th>
									<th className="p-2">H</th>
									<th className="p-2">R</th>
									<th className="p-2">RBI</th>
									<th className="p-2">BB</th>
									<th className="p-2">SO</th>
									<th className="p-2">HR</th>
									<th className="p-2">HBP</th>
									<th className="p-2">SF</th>
									<th className="p-2">1B</th>
									<th className="p-2">2B</th>
									<th className="p-2">3B</th>
									<th className="p-2">1HR</th>
									<th className="p-2">2HR</th>
									<th className="p-2">3HR</th>
									<th className="p-2">GS</th>
									<th className="p-2">TB</th>
									<th className="p-2">PA</th>
									<th className="p-2">AVG</th>
									<th className="p-2">OBP</th>
									<th className="p-2">SLG</th>
									<th className="p-2">OPS</th>
									<th className="p-2">SB</th>
									<th className="p-2">CS</th>
									<th className="p-2">ATT</th>
									<th className="p-2">SB%</th>
									<th className="p-2">SO-B</th>
									<th className="p-2">Star Hits</th>
									<th className="p-2">Star Use</th>
								</tr>
							</thead>

							<tbody>
								{sortedGames.map((game) => {
									const stats = game.stats;

									const obp = calculateOBP(
										stats.hits,
										stats.walks,
										stats.hitByPitch,
										stats.atBats,
										stats.sacFlies,
									);

									const slg = calculateSLG(
										stats.hits,
										stats.singles,
										stats.doubles,
										stats.triples,
										stats.homeRuns,
										stats.atBats,
									);

									const ops = calculateOPS(obp, slg);

									const stealPercentage =
										stats.stealAttempts !== null &&
										stats.stealAttempts > 0 &&
										stats.stolenBases !== null
											? stats.stolenBases /
												stats.stealAttempts
											: null;

									return (
										<tr
											key={game.gameId}
											className="even:bg-gray-50 text-center"
										>
											<td className="p-2 whitespace-nowrap">
												{game.playedAt
													? format(
															new Date(
																game.playedAt,
															),
															"MM/dd",
														)
													: "TBD"}
											</td>

											<td className="p-2">
												{game.opponent.abbreviation}
											</td>

											<td className="p-2">
												{stats.atBats}
											</td>

											<td className="p-2">
												{stats.hits}
											</td>

											<td className="p-2">
												{stats.runs}
											</td>

											<td className="p-2">
												{stats.rbis}
											</td>

											<td className="p-2">
												{stats.walks}
											</td>

											<td className="p-2">
												{stats.strikeouts}
											</td>

											<td className="p-2">
												{stats.homeRuns}
											</td>

											<td className="p-2">
												{formatNumber(stats.hitByPitch)}
											</td>

											<td className="p-2">
												{formatNumber(stats.sacFlies)}
											</td>

											<td className="p-2">
												{formatNumber(stats.singles)}
											</td>

											<td className="p-2">
												{formatNumber(stats.doubles)}
											</td>

											<td className="p-2">
												{formatNumber(stats.triples)}
											</td>

											<td className="p-2">
												{formatNumber(stats.oneHr)}
											</td>

											<td className="p-2">
												{formatNumber(stats.twoHr)}
											</td>

											<td className="p-2">
												{formatNumber(stats.threeHr)}
											</td>

											<td className="p-2">
												{formatNumber(stats.grandSlams)}
											</td>

											<td className="p-2">
												{formatNumber(stats.totalBases)}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.plateAppearances,
												)}
											</td>

											<td className="p-2">
												{formatRate(
													stats.battingAverage,
												)}
											</td>

											<td className="p-2">
												{formatRate(obp)}
											</td>

											<td className="p-2">
												{formatRate(slg)}
											</td>

											<td className="p-2">
												{formatRate(ops)}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.stolenBases,
												)}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.caughtStealing,
												)}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.stealAttempts,
												)}
											</td>

											<td className="p-2">
												{stealPercentage !== null
													? `${(
															stealPercentage *
															100
														).toFixed(1)}%`
													: STAT_PLACEHOLDER}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.strikeoutsBatted,
												)}
											</td>

											<td className="p-2">
												{formatNumber(stats.startHits)}
											</td>

											<td className="p-2">
												{formatNumber(
													stats.starsUsedBatting,
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</TabsContent>

				{/* =====================================================
                    PITCHING
                ====================================================== */}
				{hasPitchingStats && (
					<TabsContent value="pitch">
						<div className="overflow-x-auto rounded-lg">
							<table className="w-full min-w-[2000px] bg-white border border-gray-100 shadow text-sm">
								<thead className="bg-purple-600 text-white">
									<tr>
										<th className="p-2">Date</th>

										<th className="p-2">Opp</th>

										<th className="p-2">IP</th>

										<th className="p-2">OUTS</th>

										<th className="p-2">BF</th>

										<th className="p-2">RA</th>

										<th className="p-2">H</th>

										<th className="p-2">1B</th>

										<th className="p-2">2B</th>

										<th className="p-2">3B</th>

										<th className="p-2">HR</th>

										<th className="p-2">BB</th>

										<th className="p-2">HBP</th>

										<th className="p-2">SO</th>

										<th className="p-2">P</th>

										<th className="p-2">S</th>

										<th className="p-2">B</th>

										<th className="p-2">ERA</th>

										<th className="p-2">WHIP</th>

										<th className="p-2">BAA</th>

										<th className="p-2">OBP-A</th>

										<th className="p-2">SLG-A</th>

										<th className="p-2">OPS-A</th>

										<th className="p-2">PK</th>

										<th className="p-2">PK ATT</th>

										<th className="p-2">IR</th>

										<th className="p-2">Star Pitches</th>

										<th className="p-2">Star Use</th>
									</tr>
								</thead>

								<tbody>
									{sortedGames.map((game) => {
										const stats = game.stats;

										/*
										 * Only calculate pitching
										 * rate stats when the player
										 * actually pitched.
										 */
										const pitched = stats.outsPitched > 0;

										const inningsPitched = pitched
											? calculateInningsPitched(
													stats.outsPitched,
												)
											: null;

										const era = pitched
											? calculateEra(
													stats.runsAllowed,
													stats.outsPitched,
												)
											: null;

										const atBatsAgainst = pitched
											? getAtBatsAgainst(stats)
											: null;

										const whip = pitched
											? calculateWHIP(
													stats.walks,
													stats.hitsAllowed,
													stats.outsPitched,
												)
											: null;

										const baa = pitched
											? calculateBAA(
													stats.hitsAllowed,
													atBatsAgainst,
												)
											: null;

										const obpAgainst = pitched
											? calculateOBPAgainst(
													stats.hitsAllowed,
													stats.walks,
													atBatsAgainst,
													stats.beanBalls,
												)
											: null;

										const slgAgainst = pitched
											? calculateSLGAgainst(
													stats.hitsAllowed,
													stats.singlesAllowed,
													stats.doublesAllowed,
													stats.triplesAllowed,
													stats.homeRunsAllowed,
													atBatsAgainst,
												)
											: null;

										const opsAgainst = pitched
											? calculateOPSAgainst(
													obpAgainst,
													slgAgainst,
												)
											: null;

										return (
											<tr
												key={game.gameId}
												className="even:bg-gray-50 text-center"
											>
												<td className="p-2 whitespace-nowrap">
													{game.playedAt
														? format(
																new Date(
																	game.playedAt,
																),
																"MM/dd",
															)
														: "TBD"}
												</td>

												<td className="p-2">
													{game.opponent.abbreviation}
												</td>

												{/* IP */}
												<td className="p-2">
													{inningsPitched !== null
														? inningsPitched
														: STAT_PLACEHOLDER}
												</td>

												{/* OUTS */}
												<td className="p-2">
													{pitched
														? stats.outs
														: STAT_PLACEHOLDER}
												</td>

												{/* BF */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.battersFaced,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* RA */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.runsAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* H */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.hitsAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* 1B */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.singlesAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* 2B */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.doublesAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* 3B */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.triplesAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* HR */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.homeRunsAllowed,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* BB */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.walks,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* HBP */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.beanBalls,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* SO */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.strikeouts,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* P */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.pitches,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* S */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.strikes,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* B */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.balls,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* ERA */}
												<td className="p-2">
													{formatNumber(era, 2)}
												</td>

												{/* WHIP */}
												<td className="p-2">
													{formatRate(whip)}
												</td>

												{/* BAA */}
												<td className="p-2">
													{formatRate(baa)}
												</td>

												{/* OBP-A */}
												<td className="p-2">
													{formatRate(obpAgainst)}
												</td>

												{/* SLG-A */}
												<td className="p-2">
													{formatRate(slgAgainst)}
												</td>

												{/* OPS-A */}
												<td className="p-2">
													{formatRate(opsAgainst)}
												</td>

												{/* PK */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.pickoffs,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* PK ATT */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.pickoffAttempts,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* IR */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.inheritedRuns,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* Star Pitches */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.starPitches,
															)
														: STAT_PLACEHOLDER}
												</td>

												{/* Star Use */}
												<td className="p-2">
													{pitched
														? formatNumber(
																stats.starsUsedPitching,
															)
														: STAT_PLACEHOLDER}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</TabsContent>
				)}

				{/* =====================================================
                    FIELDING
                ====================================================== */}
				{hasFieldingStats && (
					<TabsContent value="field">
						<div className="overflow-x-auto rounded-lg">
							<table className="w-full min-w-[1100px] bg-white border border-gray-100 shadow text-sm">
								<thead className="bg-purple-600 text-white">
									<tr>
										<th className="p-2">Date</th>

										<th className="p-2">Opp</th>

										<th className="p-2">PO</th>

										<th className="p-2">A</th>

										<th className="p-2">E</th>

										<th className="p-2">DP</th>

										<th className="p-2">TP</th>

										<th className="p-2">BOB</th>

										<th className="p-2">BJ PO</th>

										<th className="p-2">BJ ATT</th>
									</tr>
								</thead>

								<tbody>
									{sortedGames.map((game) => {
										const stats = game.stats;

										return (
											<tr
												key={game.gameId}
												className="even:bg-gray-50 text-center"
											>
												<td className="p-2 whitespace-nowrap">
													{game.playedAt
														? format(
																new Date(
																	game.playedAt,
																),
																"MM/dd",
															)
														: "TBD"}
												</td>

												<td className="p-2">
													{game.opponent.abbreviation}
												</td>

												<td className="p-2">
													{formatNumber(stats.outs)}
												</td>

												<td className="p-2">
													{formatNumber(stats.assist)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.fieldingErrors,
													)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.doublePlays,
													)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.triplePlays,
													)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.bobbles,
													)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.buddyJumpPutouts,
													)}
												</td>

												<td className="p-2">
													{formatNumber(
														stats.buddyJumpAttempts,
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</TabsContent>
				)}
			</Tabs>

			{isLoading && (
				<div className="flex justify-center items-center mt-4">
					<Loader2 className="animate-spin text-lg" />
				</div>
			)}

			{!isLoading && sortedGames.length === 0 && (
				<div className="flex justify-center items-center py-8 text-sm text-gray-500">
					No game logs found.
				</div>
			)}
		</div>
	);
}
