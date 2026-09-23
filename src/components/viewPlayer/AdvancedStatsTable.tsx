"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import Link from "next/link";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";

import {
    Search,
    GitCompareArrows,
    CircleUserRound,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { RankBadge, SortIcon, SortState } from "./PlayerStatsTable";

/* =========================================================
   TYPES
   ========================================================= */

export type AdvancedBattingStatKey =
    | "atBats"
    | "plateAppearances"
    | "runs"
    | "hits"
    | "rbis"
    | "strikeouts"
    | "walksTaken"
    | "hitByPitch"
    | "singles"
    | "doubles"
    | "triples"
    | "homeRuns"
    | "oneHr"
    | "twoHr"
    | "threeHr"
    | "grandSlams"
    | "totalBases"
    | "sacFlies"
    | "startHits"
    | "starsUsedBatting"
    | "battingAverage"
    | "obp"
    | "slg"
    | "ops"
    | "stolenBases"
    | "caughtStealing"
    | "stealAttempts";

export type AdvancedFieldingStatKey =
    | "putout"
    | "assist"
    | "buddyJumpPutouts"
    | "buddyJumpAttempts"
    | "doublePlays"
    | "triplePlays"
    | "bobbles"
    | "fieldingErrors";

export type AdvancedPitchingStatKey =
    | "battersFaced"
    | "inningsPitched"
    | "pitches"
    | "strikes"
    | "balls"
    | "strikeouts"
    | "walks"
    | "beanBalls"
    | "hitsAllowed"
    | "runsAllowed"
    | "singlesAllowed"
    | "doublesAllowed"
    | "triplesAllowed"
    | "homeRunsAllowed"
    | "inheritedRuns"
    | "starPitches"
    | "starsUsedPitching"
    | "pickoffs"
    | "pickoffAttempts"
    | "era"
    | "whip"
    | "baa"
    | "obpAgainst"
    | "slgAgainst"
    | "opsAgainst";

export type AdvancedStatKey =
    | AdvancedBattingStatKey
    | AdvancedFieldingStatKey
    | AdvancedPitchingStatKey;

export type AdvancedStatDefinition<K extends string> = {
    key: K;
    label: string;
    description: string;
};

/* =========================================================
   STAT DEFINITIONS
   ========================================================= */

export const ADVANCED_BATTING_STATS: AdvancedStatDefinition<AdvancedBattingStatKey>[] =
    [
        {
            key: "atBats",
            label: "AB",
            description:
                "Official at-bats, excluding walks, hit by pitches, and sacrifice flies.",
        },
        {
            key: "plateAppearances",
            label: "PA",
            description: "Total plate appearances.",
        },
        {
            key: "runs",
            label: "R",
            description: "Runs scored.",
        },
        {
            key: "hits",
            label: "H",
            description: "Total hits.",
        },
        {
            key: "rbis",
            label: "RBI",
            description: "Runs batted in.",
        },
        {
            key: "strikeouts",
            label: "SO",
            description: "Strikeouts by the batter.",
        },
        {
            key: "walksTaken",
            label: "BB",
            description: "Base on balls.",
        },
        {
            key: "hitByPitch",
            label: "HBP",
            description:
                "Times the batter reached base after being hit by a pitch.",
        },
        {
            key: "singles",
            label: "1B",
            description: "Singles recorded.",
        },
        {
            key: "doubles",
            label: "2B",
            description: "Doubles recorded.",
        },
        {
            key: "triples",
            label: "3B",
            description: "Triples recorded.",
        },
        {
            key: "homeRuns",
            label: "HR",
            description: "Total home runs.",
        },
        {
            key: "oneHr",
            label: "1R HR",
            description: "Home runs that scored one run.",
        },
        {
            key: "twoHr",
            label: "2R HR",
            description: "Home runs that scored two runs.",
        },
        {
            key: "threeHr",
            label: "3R HR",
            description: "Home runs that scored three runs.",
        },
        {
            key: "grandSlams",
            label: "GS",
            description: "Grand slams, home runs with the bases loaded.",
        },
        {
            key: "totalBases",
            label: "TB",
            description: "Total bases accumulated from hits.",
        },
        {
            key: "sacFlies",
            label: "SF",
            description: "Sacrifice flies.",
        },
        {
            key: "startHits",
            label: "Star Hits",
            description: "Hits recorded using star power.",
        },
        {
            key: "starsUsedBatting",
            label: "Stars",
            description: "Stars used while batting.",
        },
        {
            key: "battingAverage",
            label: "AVG",
            description:
                "Batting average, calculated from hits divided by at-bats.",
        },
        {
            key: "obp",
            label: "OBP",
            description: "On-base percentage.",
        },
        {
            key: "slg",
            label: "SLG",
            description: "Slugging percentage.",
        },
        {
            key: "ops",
            label: "OPS",
            description: "On-base percentage plus slugging percentage.",
        },
        {
            key: "stolenBases",
            label: "SB",
            description: "Successful stolen bases.",
        },
        {
            key: "caughtStealing",
            label: "CS",
            description: "Times caught stealing.",
        },
        {
            key: "stealAttempts",
            label: "ATT",
            description: "Total stolen-base attempts.",
        },
    ];

export const ADVANCED_FIELDING_STATS: AdvancedStatDefinition<AdvancedFieldingStatKey>[] =
    [
        {
            key: "putout",
            label: "PO",
            description: "Putouts recorded by the fielder.",
        },
        {
            key: "assist",
            label: "A",
            description: "Assists recorded by the fielder.",
        },
        {
            key: "buddyJumpPutouts",
            label: "BJ PO",
            description: "Putouts recorded using a buddy jump.",
        },
        {
            key: "buddyJumpAttempts",
            label: "BJ ATT",
            description: "Attempts to make a putout using a buddy jump.",
        },
        {
            key: "doublePlays",
            label: "DP",
            description: "Double plays recorded.",
        },
        {
            key: "triplePlays",
            label: "TP",
            description: "Triple plays recorded.",
        },
        {
            key: "bobbles",
            label: "Bobbles",
            description: "Fielding bobbles recorded.",
        },
        {
            key: "fieldingErrors",
            label: "Errors",
            description: "Fielding errors committed.",
        },
    ];

export const ADVANCED_PITCHING_STATS: AdvancedStatDefinition<AdvancedPitchingStatKey>[] =
    [
        {
            key: "battersFaced",
            label: "BF",
            description: "Total batters faced by the pitcher.",
        },
        {
            key: "inningsPitched",
            label: "IP",
            description: "Innings pitched.",
        },
        {
            key: "pitches",
            label: "Pitches",
            description: "Total pitches thrown.",
        },
        {
            key: "strikes",
            label: "Strikes",
            description: "Total strikes thrown.",
        },
        {
            key: "balls",
            label: "Balls",
            description: "Total balls thrown.",
        },
        {
            key: "strikeouts",
            label: "SO",
            description: "Strikeouts recorded by the pitcher.",
        },
        {
            key: "walks",
            label: "BB",
            description: "Walks issued by the pitcher.",
        },
        {
            key: "beanBalls",
            label: "Bean",
            description: "Batters hit by the pitcher.",
        },
        {
            key: "hitsAllowed",
            label: "H",
            description: "Hits allowed by the pitcher.",
        },
        {
            key: "runsAllowed",
            label: "RA",
            description: "Runs allowed by the pitcher.",
        },
        {
            key: "singlesAllowed",
            label: "1BA",
            description: "Singles allowed by the pitcher.",
        },
        {
            key: "doublesAllowed",
            label: "2BA",
            description: "Doubles allowed by the pitcher.",
        },
        {
            key: "triplesAllowed",
            label: "3BA",
            description: "Triples allowed by the pitcher.",
        },
        {
            key: "homeRunsAllowed",
            label: "HRA",
            description: "Home runs allowed by the pitcher.",
        },
        {
            key: "inheritedRuns",
            label: "IR",
            description: "Runs inherited from a previous pitcher.",
        },
        {
            key: "starPitches",
            label: "Star Pitches",
            description: "Pitches that qualify as star pitches.",
        },
        {
            key: "starsUsedPitching",
            label: "Stars",
            description: "Stars used while pitching.",
        },
        {
            key: "pickoffs",
            label: "PK",
            description: "Pickoffs recorded by the pitcher.",
        },
        {
            key: "pickoffAttempts",
            label: "PK ATT",
            description: "Pickoff attempts made by the pitcher.",
        },
        {
            key: "era",
            label: "ERA",
            description: "Earned run average.",
        },
        {
            key: "whip",
            label: "WHIP",
            description: "Walks and hits allowed per inning pitched.",
        },
        {
            key: "baa",
            label: "BAA",
            description: "Batting average allowed against the pitcher.",
        },
        {
            key: "obpAgainst",
            label: "OBP",
            description: "On-base percentage allowed against the pitcher.",
        },
        {
            key: "slgAgainst",
            label: "SLG",
            description: "Slugging percentage allowed against the pitcher.",
        },
        {
            key: "opsAgainst",
            label: "OPS",
            description:
                "On-base percentage plus slugging percentage allowed against the pitcher.",
        },
    ];

/* =========================================================
   VALUE HELPERS
   ========================================================= */

export function getAdvancedStatValue(
    player: PlayerWithStatsDto,
    key: AdvancedStatKey,
): number | null {
    const stats = player.stats as Partial<Record<AdvancedStatKey, unknown>>;

    const value = stats?.[key];

    return typeof value === "number" ? value : null;
}

export function formatAdvancedStat(
    player: PlayerWithStatsDto,
    key: AdvancedStatKey,
): string {
    const value = getAdvancedStatValue(player, key);

    if (value === null) {
        return "—";
    }

    if (
        key === "battingAverage" ||
        key === "obp" ||
        key === "slg" ||
        key === "ops" ||
        key === "baa" ||
        key === "obpAgainst" ||
        key === "slgAgainst" ||
        key === "opsAgainst"
    ) {
        return value.toFixed(3);
    }

    if (key === "era" || key === "whip") {
        return value.toFixed(2);
    }

    return String(value);
}

/* =========================================================
   COMPONENT TYPES
   ========================================================= */

type AdvancedStatsTableProps<K extends string> = {
    playerList: PlayerWithStatsDto[];
    stats: AdvancedStatDefinition<K>[];
    sort: SortState<K>;
    onSort: (key: K) => void;
    freeAgents: boolean;
    onPlayerClick: (player: PlayerWithStatsDto) => void;
};

/* =========================================================
   HORIZONTAL SCROLL MEMORY
   ========================================================= */

const advancedTableScrollPositions = new Map<string, number>();

function getScrollKey<K extends string>(
    stats: AdvancedStatDefinition<K>[],
    freeAgents: boolean,
) {
    const statKey = stats.map((stat) => String(stat.key)).join("|");

    return `${freeAgents ? "free-agents" : "all-players"}:${statKey}`;
}

/* =========================================================
   TOOLTIP TYPES
   ========================================================= */

type TooltipState = {
    label: string;
    description: string;
    left: number;
    top: number;
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AdvancedStatsTable<K extends string>({
    playerList,
    stats,
    sort,
    onSort,
    freeAgents,
    onPlayerClick,
}: AdvancedStatsTableProps<K>) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollKey = getScrollKey(stats, freeAgents);

    const [canScrollLeft, setCanScrollLeft] = useState(false);

    const [canScrollRight, setCanScrollRight] = useState(false);

    const [scrollPercent, setScrollPercent] = useState(0);

    const [hoveredStat, setHoveredStat] = useState<TooltipState | null>(null);

    /* =====================================================
       SCROLL STATE
       ===================================================== */

    const updateScrollState = () => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const maxScroll = Math.max(
            0,
            element.scrollWidth - element.clientWidth,
        );

        advancedTableScrollPositions.set(scrollKey, element.scrollLeft);

        setCanScrollLeft(element.scrollLeft > 4);

        setCanScrollRight(element.scrollLeft < maxScroll - 4);

        setScrollPercent(
            maxScroll > 0 ? (element.scrollLeft / maxScroll) * 100 : 0,
        );
    };

    /* =====================================================
       TOOLTIP
       ===================================================== */

    const showTooltip = (
        event: React.MouseEvent<HTMLButtonElement>,
        stat: AdvancedStatDefinition<K>,
    ) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const tooltipWidth = 280;
        const edgePadding = 12;
        const halfTooltipWidth = tooltipWidth / 2;

        let left = rect.left + rect.width / 2;

        if (left - halfTooltipWidth < edgePadding) {
            left = halfTooltipWidth + edgePadding;
        }

        if (left + halfTooltipWidth > window.innerWidth - edgePadding) {
            left = window.innerWidth - halfTooltipWidth - edgePadding;
        }

        setHoveredStat({
            label: stat.label,
            description: stat.description,
            left,
            top: Math.max(rect.top - 10, 12),
        });
    };

    const hideTooltip = () => {
        setHoveredStat(null);
    };

    /* =====================================================
       RESTORE HORIZONTAL SCROLL
       ===================================================== */

    useLayoutEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const savedPosition = advancedTableScrollPositions.get(scrollKey) ?? 0;

        element.scrollLeft = savedPosition;

        updateScrollState();

        const frame = requestAnimationFrame(() => {
            const currentElement = scrollRef.current;

            if (!currentElement) {
                return;
            }

            const currentSavedPosition =
                advancedTableScrollPositions.get(scrollKey) ?? 0;

            currentElement.scrollLeft = currentSavedPosition;

            updateScrollState();
        });

        return () => cancelAnimationFrame(frame);
    }, [scrollKey, playerList, sort.key, sort.direction]);

    /* =====================================================
       SORT
       ===================================================== */

    const handleSort = (key: K) => {
        const element = scrollRef.current;

        if (element) {
            advancedTableScrollPositions.set(scrollKey, element.scrollLeft);
        }

        onSort(key);
    };

    /* =====================================================
       HORIZONTAL SCROLL BUTTONS
       ===================================================== */

    const scrollHorizontally = (direction: "left" | "right") => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const amount = 300;

        element.scrollBy({
            left: direction === "right" ? amount : -amount,
            behavior: "smooth",
        });
    };

    /* =====================================================
       INITIAL / RESIZE STATE
       ===================================================== */

    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        updateScrollState();

        const handleResize = () => {
            updateScrollState();

            const savedPosition =
                advancedTableScrollPositions.get(scrollKey) ?? 0;

            element.scrollLeft = savedPosition;

            updateScrollState();
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [scrollKey]);

    /* =====================================================
       MOUSE / WHEEL
       ===================================================== */

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (
            !event.shiftKey ||
            Math.abs(event.deltaY) <= Math.abs(event.deltaX)
        ) {
            return;
        }

        const element = scrollRef.current;

        if (!element) {
            return;
        }

        event.preventDefault();

        element.scrollLeft += event.deltaY;

        advancedTableScrollPositions.set(scrollKey, element.scrollLeft);
    };

    /* =====================================================
       KEYBOARD
       ===================================================== */

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }

        event.preventDefault();

        scrollHorizontally(event.key === "ArrowRight" ? "right" : "left");
    };

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* =====================================================
                DESKTOP NAVIGATION
                ===================================================== */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Statistics
                    </span>

                    <span className="hidden text-xs text-gray-400 sm:inline">
                        Shift + scroll to move horizontally • arrows move one
                        stat column
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 sm:block">
                        <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-150"
                            style={{
                                width: `${
                                    canScrollLeft || canScrollRight
                                        ? Math.max(scrollPercent, 4)
                                        : 100
                                }%`,
                            }}
                        />
                    </div>

                    <span className="hidden text-[10px] font-medium tabular-nums text-gray-400 sm:inline">
                        {Math.round(scrollPercent)}%
                    </span>

                    <button
                        type="button"
                        onClick={() => scrollHorizontally("left")}
                        disabled={!canScrollLeft}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Scroll statistics left"
                        title="Scroll statistics left"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollHorizontally("right")}
                        disabled={!canScrollRight}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Scroll statistics right"
                        title="Scroll statistics right"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {/* =====================================================
                FLOATING NAVIGATION
                ===================================================== */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scrollHorizontally("left")}
                    className="fixed left-4 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-600 shadow-xl backdrop-blur transition hover:scale-105 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:flex"
                    aria-label="Show previous statistics"
                    title="Previous statistics"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            )}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scrollHorizontally("right")}
                    className="fixed right-4 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-600 shadow-xl transition hover:scale-105 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:flex"
                    aria-label="Show next statistics"
                    title="Next statistics"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            )}
            {/* =====================================================
    TOOLTIP
    ===================================================== */}
            {hoveredStat && (
                <div
                    className="pointer-events-none fixed z-[9999] w-[190px] -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-gray-900 px-3 py-2.5 text-left shadow-xl"
                    style={{
                        left: hoveredStat.left,
                        top: hoveredStat.top,
                    }}
                >
                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {hoveredStat.label}
                    </div>

                    <p className="text-[10px] leading-snug text-gray-300">
                        {hoveredStat.description}
                    </p>

                    <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-gray-200 bg-gray-900" />
                </div>
            )}

            {/* =====================================================
                TABLE
                ===================================================== */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    tabIndex={0}
                    onScroll={updateScrollState}
                    onWheel={handleWheel}
                    onKeyDown={handleKeyDown}
                    onMouseEnter={updateScrollState}
                    className="relative z-0 max-h-[calc(100vh-220px)] overflow-auto outline-none [scrollbar-width:none] focus:ring-2 focus:ring-inset focus:ring-blue-100 [&::-webkit-scrollbar]:hidden"
                >
                    <table className="w-full min-w-max border-separate border-spacing-0">
                        <thead>
                            <tr>
                                {/* Rank */}
                                <th className="sticky left-0 top-0 z-[100] w-16 border-r border-gray-200 bg-gray-50 px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    #
                                </th>

                                {/* Player */}
                                <th className="sticky left-16 top-0 z-[100] min-w-[240px] border-r border-gray-200 bg-gray-50 px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Player
                                </th>

                                {/* Team */}
                                {!freeAgents && (
                                    <th className="sticky top-0 z-[90] min-w-[160px] border-r border-gray-100 bg-gray-50 px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                        Team
                                    </th>
                                )}

                                {/* Advanced Stats */}
                                {stats.map((stat) => {
                                    const active = sort.key === stat.key;

                                    return (
                                        <th
                                            key={stat.key}
                                            className="sticky top-0 z-[80] min-w-[85px] border-r border-gray-100 bg-gray-50 px-3 py-3 text-center"
                                            onMouseEnter={(event) =>
                                                showTooltip(
                                                    event as unknown as React.MouseEvent<HTMLButtonElement>,
                                                    stat,
                                                )
                                            }
                                            onMouseLeave={hideTooltip}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(stat.key)
                                                }
                                                className="mx-auto flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-500 transition hover:text-blue-700"
                                            >
                                                {stat.label}

                                                <SortIcon
                                                    active={active}
                                                    direction={sort.direction}
                                                />
                                            </button>
                                        </th>
                                    );
                                })}

                                {/* Action */}
                                <th className="sticky right-0 top-0 z-[100] w-28 border-l border-gray-200 bg-gray-50 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {playerList.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            stats.length + (freeAgents ? 3 : 4)
                                        }
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
                            ) : (
                                playerList.map((player, index) => (
                                    <tr
                                        key={`advanced-${player.id}`}
                                        className="group cursor-pointer border-t border-gray-100 transition-colors hover:bg-blue-50/40"
                                        onClick={() => onPlayerClick(player)}
                                    >
                                        {/* Rank */}
                                        <td className="sticky left-0 z-[60] w-16 border-r border-gray-200 bg-white px-4 py-3.5 group-hover:bg-blue-50">
                                            <RankBadge rank={index + 1} />
                                        </td>

                                        {/* Player */}
                                        <td className="sticky left-16 z-[60] min-w-[240px] border-r border-gray-200 bg-white px-5 py-3.5 group-hover:bg-blue-50">
                                            <div className="flex items-center gap-3">
                                                {player.image ? (
                                                    <img
                                                        src={player.image}
                                                        alt={player.name}
                                                        className="h-10 w-10 shrink-0 rounded-full border border-gray-200 bg-gray-100 object-cover shadow-sm transition-transform group-hover:scale-105"
                                                        style={{
                                                            transform:
                                                                "scaleX(-1)",
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
                                            <td className="min-w-[160px] border-r border-gray-100 bg-white px-5 py-3.5">
                                                {player.team ? (
                                                    <div className="flex items-center gap-2.5">
                                                        {player.team.logo ? (
                                                            <img
                                                                src={
                                                                    player.team
                                                                        .logo
                                                                }
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

                                        {/* Advanced Stats */}
                                        {stats.map((stat) => {
                                            const value = formatAdvancedStat(
                                                player,
                                                stat.key as AdvancedStatKey,
                                            );

                                            const isUnavailable = value === "—";

                                            return (
                                                <td
                                                    key={stat.key}
                                                    className="min-w-[85px] border-r border-gray-100 bg-white px-3 py-3.5 text-center"
                                                >
                                                    <span
                                                        className={
                                                            isUnavailable
                                                                ? "font-mono text-sm font-semibold tabular-nums text-gray-300"
                                                                : "font-mono text-sm font-semibold tabular-nums text-gray-800"
                                                        }
                                                    >
                                                        {value}
                                                    </span>
                                                </td>
                                            );
                                        })}

                                        {/* Compare */}
                                        <td
                                            className="sticky right-0 z-[60] w-28 border-l border-gray-200 bg-white px-4 py-3.5 text-right group-hover:bg-blue-50/40"
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
