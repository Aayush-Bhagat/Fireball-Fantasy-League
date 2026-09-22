"use client";

import React from "react";
import Link from "next/link";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";

import {
	Search,
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	GitCompareArrows,
	CircleUserRound,
} from "lucide-react";

/* =========================================================
   TYPES
   ========================================================= */

export type PlayerStatsTableType = "bat" | "pitch" | "field";

export type BattingStatKey = "battingAverage" | "homeRuns" | "hits" | "rbis";

export type PitchingStatKey =
	| "era"
	| "runsAllowed"
	| "strikeouts"
	| "inningsPitched";

export type FieldingStatKey = "outs" | "assist";

export type SortDirection = "desc" | "asc" | null;

export type SortState<T> = {
	key: T | null;
	direction: SortDirection;
};

type RankedPlayer = PlayerWithStatsDto & {
	rank: number;
};

type PlayerStatsTableProps = {
	type: PlayerStatsTableType;
	playerList: RankedPlayer[];
	freeAgents: boolean;

	batSort: SortState<BattingStatKey>;
	pitchSort: SortState<PitchingStatKey>;
	fieldSort: SortState<FieldingStatKey>;

	onSort: (
		key: BattingStatKey | PitchingStatKey | FieldingStatKey,
		type: PlayerStatsTableType,
	) => void;

	onPlayerClick: (player: PlayerWithStatsDto) => void;
};

/* =========================================================
   HELPERS
   ========================================================= */

function StatValue({ children }: { children: React.ReactNode }) {
	return <span className="font-mono tabular-nums">{children}</span>;
}

export function SortIcon({
	active,
	direction,
}: {
	active: boolean;
	direction: SortDirection;
}) {
	if (!active) {
		return <ArrowUpDown className="h-3 w-3 text-gray-300" />;
	}

	if (direction === "asc") {
		return <ArrowUp className="h-3 w-3 text-blue-600" />;
	}

	return <ArrowDown className="h-3 w-3 text-blue-600" />;
}

export function RankBadge({ rank }: { rank: number }) {
	let className =
		"flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold";

	if (rank === 1) {
		className += " bg-yellow-100 text-yellow-700";
	} else if (rank === 2) {
		className += " bg-gray-200 text-gray-700";
	} else if (rank === 3) {
		className += " bg-orange-100 text-orange-700";
	} else {
		className += " bg-gray-100 text-gray-500";
	}

	return <div className={className}>{rank}</div>;
}

function SortableHeader({
	label,
	active,
	direction,
	onClick,
}: {
	label: string;
	active: boolean;
	direction: SortDirection;
	onClick: () => void;
}) {
	return (
		<th className="px-4 py-3 text-center">
			<button
				type="button"
				onClick={onClick}
				className="mx-auto flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 transition hover:text-blue-700"
			>
				{label}

				<SortIcon active={active} direction={direction} />
			</button>
		</th>
	);
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function PlayerStatsTable({
	type,
	playerList,
	freeAgents,
	batSort,
	pitchSort,
	fieldSort,
	onSort,
	onPlayerClick,
}: PlayerStatsTableProps) {
	if (playerList.length === 0) {
		const columnCount =
			type === "field" ? (freeAgents ? 6 : 7) : freeAgents ? 7 : 8;

		return (
			<div className="overflow-x-auto">
				<table className="w-full min-w-[760px]">
					<tbody>
						<tr>
							<td
								colSpan={columnCount}
								className="px-6 py-16 text-center"
							>
								<div className="flex flex-col items-center justify-center">
									<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
										<Search className="h-5 w-5 text-gray-400" />
									</div>

									<p className="font-semibold text-gray-700">
										No players found
									</p>

									<p className="mt-1 text-sm text-gray-400">
										Try a different search.
									</p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	const sort =
		type === "bat" ? batSort : type === "pitch" ? pitchSort : fieldSort;

	return (
		<div className="relative max-h-[calc(100vh-280px)] min-h-[400px] overflow-auto">
			<table
				className={
					type === "field"
						? "w-full min-w-[680px]"
						: "w-full min-w-[760px]"
				}
			>
				<thead className="sticky top-0 z-30 bg-gray-50">
					<tr className="border-b border-gray-100">
						<th className="w-16 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
							#
						</th>

						<th className="min-w-[240px] px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
							Player
						</th>

						{!freeAgents && (
							<th className="min-w-[160px] px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
								Team
							</th>
						)}

						{type === "bat" && (
							<>
								<SortableHeader
									label="AVG"
									active={sort.key === "battingAverage"}
									direction={sort.direction}
									onClick={() =>
										onSort("battingAverage", "bat")
									}
								/>

								<SortableHeader
									label="HR"
									active={sort.key === "homeRuns"}
									direction={sort.direction}
									onClick={() => onSort("homeRuns", "bat")}
								/>

								<SortableHeader
									label="H"
									active={sort.key === "hits"}
									direction={sort.direction}
									onClick={() => onSort("hits", "bat")}
								/>

								<SortableHeader
									label="RBI"
									active={sort.key === "rbis"}
									direction={sort.direction}
									onClick={() => onSort("rbis", "bat")}
								/>
							</>
						)}

						{type === "pitch" && (
							<>
								<SortableHeader
									label="ERA"
									active={sort.key === "era"}
									direction={sort.direction}
									onClick={() => onSort("era", "pitch")}
								/>

								<SortableHeader
									label="RA"
									active={sort.key === "runsAllowed"}
									direction={sort.direction}
									onClick={() =>
										onSort("runsAllowed", "pitch")
									}
								/>

								<SortableHeader
									label="SO"
									active={sort.key === "strikeouts"}
									direction={sort.direction}
									onClick={() =>
										onSort("strikeouts", "pitch")
									}
								/>

								<SortableHeader
									label="IP"
									active={sort.key === "inningsPitched"}
									direction={sort.direction}
									onClick={() =>
										onSort("inningsPitched", "pitch")
									}
								/>
							</>
						)}

						{type === "field" && (
							<>
								<th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
									Position
								</th>

								<SortableHeader
									label="Put Outs"
									active={sort.key === "outs"}
									direction={sort.direction}
									onClick={() => onSort("outs", "field")}
								/>
								<SortableHeader
									label="Assists"
									active={sort.key === "assist"}
									direction={sort.direction}
									onClick={() => onSort("assist", "field")}
								/>
							</>
						)}

						<th className="w-28 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">
							Action
						</th>
					</tr>
				</thead>

				<tbody>
					{playerList.map((player) => (
						<tr
							key={player.id}
							className="group cursor-pointer border-t border-gray-100 transition-colors hover:bg-blue-50/40"
							onClick={() => onPlayerClick(player)}
						>
							{/* Rank */}
							<td className="px-4 py-3.5">
								<RankBadge rank={player.rank} />
							</td>

							{/* Player */}
							<td className="px-5 py-3.5">
								<div className="flex items-center gap-3">
									{player.image ? (
										<img
											src={player.image}
											alt={player.name}
											className="h-10 w-10 shrink-0 rounded-full border border-gray-200 bg-gray-100 object-cover shadow-sm transition-transform group-hover:scale-105"
											style={{
												transform: "scaleX(-1)",
											}}
										/>
									) : (
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
											<CircleUserRound className="h-5 w-5 text-gray-400" />
										</div>
									)}

									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="truncate font-semibold text-gray-900">
												{player.name}
											</span>
										</div>

										<span className="text-[11px] text-gray-400">
											{player.position}
										</span>
									</div>
								</div>
							</td>

							{/* Team */}
							{!freeAgents && (
								<td className="px-5 py-3.5">
									{player.team ? (
										<div className="flex items-center gap-2.5">
											{player.team.logo ? (
												<img
													src={player.team.logo}
													alt={`${player.team.name} logo`}
													className="h-7 w-7 rounded-full border border-gray-100 object-cover"
												/>
											) : (
												<div className="h-7 w-7 rounded-full bg-gray-100" />
											)}

											<span className="text-sm font-medium text-gray-600">
												{player.team.name}
											</span>
										</div>
									) : (
										<span className="text-sm text-gray-400">
											Free Agent
										</span>
									)}
								</td>
							)}

							{/* Batting */}
							{type === "bat" && (
								<>
									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.battingAverage.toFixed(
														3,
													)
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.homeRuns
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.hits
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.rbis
												: "—"}
										</StatValue>
									</td>
								</>
							)}

							{/* Pitching */}
							{type === "pitch" && (
								<>
									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.era.toFixed(2)
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.runsAllowed
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.strikeouts
												: "—"}
										</StatValue>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.inningsPitched
												: "—"}
										</StatValue>
									</td>
								</>
							)}

							{/* Fielding */}
							{type === "field" && (
								<>
									<td className="px-4 py-3.5 text-center">
										<span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
											{player.position}
										</span>
									</td>

									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.outs
												: "—"}
										</StatValue>
									</td>
									<td className="px-4 py-3.5 text-center">
										<StatValue>
											{player.stats
												? player.stats.assist
												: "—"}
										</StatValue>
									</td>
								</>
							)}

							{/* Compare */}
							<td
								className="px-4 py-3.5 text-right"
								onClick={(e) => e.stopPropagation()}
							>
								<Link
									href={`/compare?rightPlayer=${player.id}`}
									className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow"
								>
									<GitCompareArrows className="h-3.5 w-3.5" />

									<span className="hidden lg:inline">
										Compare
									</span>
								</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
