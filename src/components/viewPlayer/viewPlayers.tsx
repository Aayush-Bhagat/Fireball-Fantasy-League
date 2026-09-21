"use client";

import React, { useMemo, useState } from "react";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";

import PlayerCardTabs from "@/components/playerCardTabs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Search, X, Trophy, Shield, Crosshair, BarChart3 } from "lucide-react";

import StatsTableCard from "./StatsTableCard";

import PlayerStatsTable, {
    PlayerStatsTableType,
    BattingStatKey,
    PitchingStatKey,
    FieldingStatKey,
    SortDirection,
    SortState,
} from "./PlayerStatsTable";

import AdvancedStatsTable, {
    AdvancedBattingStatKey,
    AdvancedFieldingStatKey,
    AdvancedPitchingStatKey,
    ADVANCED_BATTING_STATS,
    ADVANCED_FIELDING_STATS,
    ADVANCED_PITCHING_STATS,
    getAdvancedStatValue,
} from "./AdvancedStatsTable";

/*
 * ============================================================
 * Props
 * ============================================================
 */

type Props = {
    players: PlayerWithStatsDto[];
    freeAgents?: boolean;
};

/*
 * ============================================================
 * Sort Helper
 * ============================================================
 */

function getNextSortDirection<T>(
    currentKey: T | null,
    currentDirection: SortDirection,
    newKey: T,
): SortDirection {
    if (currentKey !== newKey) {
        return "desc";
    }

    if (currentDirection === "desc") {
        return "asc";
    }

    if (currentDirection === "asc") {
        return null;
    }

    return "desc";
}

/*
 * ============================================================
 * Component
 * ============================================================
 */

export default function ViewPlayers({ players, freeAgents = false }: Props) {
    const [selectedPlayer, setSelectedPlayer] =
        useState<PlayerWithStatsDto | null>(null);

    const [showCard, setShowCard] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [advancedTab, setAdvancedTab] = useState("advanced-bat");

    /*
     * ========================================================
     * Normal Sorting
     * ========================================================
     */

    const [batSort, setBatSort] = useState<SortState<BattingStatKey>>({
        key: null,
        direction: null,
    });

    const [pitchSort, setPitchSort] = useState<SortState<PitchingStatKey>>({
        key: null,
        direction: null,
    });

    const [fieldSort, setFieldSort] = useState<SortState<FieldingStatKey>>({
        key: null,
        direction: null,
    });

    /*
     * ========================================================
     * Advanced Sorting
     * ========================================================
     */

    const [advancedBatSort, setAdvancedBatSort] = useState<
        SortState<AdvancedBattingStatKey>
    >({
        key: null,
        direction: null,
    });

    const [advancedPitchSort, setAdvancedPitchSort] = useState<
        SortState<AdvancedPitchingStatKey>
    >({
        key: null,
        direction: null,
    });

    const [advancedFieldSort, setAdvancedFieldSort] = useState<
        SortState<AdvancedFieldingStatKey>
    >({
        key: null,
        direction: null,
    });

    /*
     * ========================================================
     * Player Card
     * ========================================================
     */

    const handlePlayerClick = (player: PlayerWithStatsDto) => {
        setSelectedPlayer(player);
        setShowCard(true);
    };

    const closePlayerCard = () => {
        setShowCard(false);
        setSelectedPlayer(null);
    };

    /*
     * ========================================================
     * Default Batting Rankings
     * ========================================================
     */

    const defaultBattingRankings = useMemo(() => {
        const weights = {
            hr: 2,
            rbi: 1,
            avg: 2.5,
        };

        const maxHR = Math.max(
            ...players.map((p) => p.stats?.homeRuns ?? 0),
            0,
        );

        const maxRBI = Math.max(...players.map((p) => p.stats?.rbis ?? 0), 0);

        const maxAVG = Math.max(
            ...players.map((p) => p.stats?.battingAverage ?? 0),
            0,
        );

        return players
            .filter(
                (p) =>
                    p.stats &&
                    p.stats.battingAverage !== undefined &&
                    p.stats.battingAverage !== null,
            )
            .map((player) => {
                const stats = player.stats;

                const normalizedHR =
                    maxHR > 0 ? (stats.homeRuns / maxHR) * 100 : 0;

                const normalizedRBI =
                    maxRBI > 0 ? (stats.rbis / maxRBI) * 100 : 0;

                const normalizedAVG =
                    maxAVG > 0 ? (stats.battingAverage / maxAVG) * 100 : 0;

                const score =
                    normalizedHR * weights.hr +
                    normalizedRBI * weights.rbi +
                    normalizedAVG * weights.avg;

                return {
                    ...player,
                    rankingScore: score,
                };
            })
            .sort((a, b) => b.rankingScore - a.rankingScore)
            .map((player, index) => ({
                ...player,
                rank: index + 1,
            }));
    }, [players]);

    /*
     * ========================================================
     * Default Pitching Rankings
     * ========================================================
     */

    const defaultPitchingRankings = useMemo(() => {
        const weights = {
            era: -4,
            so: 0.15,
            ip: 2,
        };

        return players
            .filter(
                (p) =>
                    p.stats &&
                    p.stats.era !== undefined &&
                    p.stats.era !== null &&
                    p.stats.inningsPitched >= p.stats.gamesPlayed,
            )
            .map((player) => {
                const stats = player.stats;

                const score =
                    stats.era * weights.era +
                    stats.strikeouts * weights.so +
                    stats.inningsPitched * weights.ip;

                return {
                    ...player,
                    rankingScore: score,
                };
            })
            .sort((a, b) => b.rankingScore - a.rankingScore)
            .map((player, index) => ({
                ...player,
                rank: index + 1,
            }));
    }, [players]);

    /*
     * ========================================================
     * Default Fielding Rankings
     * ========================================================
     */

    const defaultFieldingRankings = useMemo(() => {
        const maxPutouts = Math.max(
            ...players.map((p) => p.stats?.putout ?? 0),
            0,
        );

        return players
            .filter(
                (p) =>
                    p.stats &&
                    p.stats.putout !== null &&
                    p.stats.putout !== undefined,
            )
            .map((player) => {
                const putouts = player.stats.putout ?? 0;

                const normalizedPutouts =
                    maxPutouts > 0 ? (putouts / maxPutouts) * 100 : 0;

                return {
                    ...player,
                    rankingScore: normalizedPutouts,
                };
            })
            .sort((a, b) => b.rankingScore - a.rankingScore)
            .map((player, index) => ({
                ...player,
                rank: index + 1,
            }));
    }, [players]);

    /*
     * ========================================================
     * Sorted Batters
     * ========================================================
     */

    const sortedBatters = useMemo(() => {
        if (!batSort.key || !batSort.direction) {
            return defaultBattingRankings;
        }

        const sorted = [...defaultBattingRankings].sort((a, b) => {
            const aValue = a.stats[batSort.key!];
            const bValue = b.stats[batSort.key!];

            if (aValue == null && bValue == null) {
                return 0;
            }

            if (aValue == null) {
                return 1;
            }

            if (bValue == null) {
                return -1;
            }

            return batSort.direction === "asc"
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        });

        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
    }, [defaultBattingRankings, batSort]);

    /*
     * ========================================================
     * Sorted Pitchers
     * ========================================================
     */

    const sortedPitchers = useMemo(() => {
        if (!pitchSort.key || !pitchSort.direction) {
            return defaultPitchingRankings;
        }

        const sorted = [...defaultPitchingRankings].sort((a, b) => {
            const aValue = a.stats[pitchSort.key!];
            const bValue = b.stats[pitchSort.key!];

            if (aValue == null && bValue == null) {
                return 0;
            }

            if (aValue == null) {
                return 1;
            }

            if (bValue == null) {
                return -1;
            }

            return pitchSort.direction === "asc"
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        });

        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
    }, [defaultPitchingRankings, pitchSort]);

    /*
     * ========================================================
     * Sorted Fielders
     * ========================================================
     */

    const sortedFielders = useMemo(() => {
        if (!fieldSort.key || !fieldSort.direction) {
            return defaultFieldingRankings;
        }

        const sorted = [...defaultFieldingRankings].sort((a, b) => {
            const aValue = a.stats[fieldSort.key!];
            const bValue = b.stats[fieldSort.key!];

            if (aValue == null && bValue == null) {
                return 0;
            }

            if (aValue == null) {
                return 1;
            }

            if (bValue == null) {
                return -1;
            }

            return fieldSort.direction === "asc"
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        });

        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
    }, [defaultFieldingRankings, fieldSort]);

    /*
     * ========================================================
     * Search
     * ========================================================
     */

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredBatters = useMemo(
        () =>
            sortedBatters.filter((player) =>
                player.name.toLowerCase().includes(normalizedSearch),
            ),
        [sortedBatters, normalizedSearch],
    );

    const filteredPitchers = useMemo(
        () =>
            sortedPitchers.filter((player) =>
                player.name.toLowerCase().includes(normalizedSearch),
            ),
        [sortedPitchers, normalizedSearch],
    );

    const filteredFielders = useMemo(
        () =>
            sortedFielders.filter((player) =>
                player.name.toLowerCase().includes(normalizedSearch),
            ),
        [sortedFielders, normalizedSearch],
    );

    /*
     * ========================================================
     * Advanced Batters
     * ========================================================
     */

    const advancedBatters = useMemo(() => {
        const filtered = players.filter((player) =>
            player.name.toLowerCase().includes(normalizedSearch),
        );

        const sortKey = advancedBatSort.key;

        if (!sortKey || !advancedBatSort.direction) {
            return filtered;
        }

        return [...filtered].sort((a, b) => {
            const aValue = getAdvancedStatValue(a, sortKey);
            const bValue = getAdvancedStatValue(b, sortKey);

            if (aValue === null && bValue === null) {
                return 0;
            }

            if (aValue === null) {
                return 1;
            }

            if (bValue === null) {
                return -1;
            }

            return advancedBatSort.direction === "asc"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [players, normalizedSearch, advancedBatSort]);

    /*
     * ========================================================
     * Advanced Pitchers
     * ========================================================
     */

    const advancedPitchers = useMemo(() => {
        const filtered = players.filter(
            (player) =>
                player.name.toLowerCase().includes(normalizedSearch) &&
                (player.stats?.inningsPitched ?? 0) >= 1,
        );

        const sortKey = advancedPitchSort.key;

        if (!sortKey || !advancedPitchSort.direction) {
            return filtered;
        }

        return [...filtered].sort((a, b) => {
            const aValue = getAdvancedStatValue(a, sortKey);
            const bValue = getAdvancedStatValue(b, sortKey);

            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            return advancedPitchSort.direction === "asc"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [players, normalizedSearch, advancedPitchSort]);

    /*
     * ========================================================
     * Advanced Fielders
     * ========================================================
     */

    const advancedFielders = useMemo(() => {
        const filtered = players.filter((player) =>
            player.name.toLowerCase().includes(normalizedSearch),
        );

        const sortKey = advancedFieldSort.key;

        if (!sortKey || !advancedFieldSort.direction) {
            return filtered;
        }

        return [...filtered].sort((a, b) => {
            const aValue = getAdvancedStatValue(a, sortKey);
            const bValue = getAdvancedStatValue(b, sortKey);

            if (aValue === null && bValue === null) {
                return 0;
            }

            if (aValue === null) {
                return 1;
            }

            if (bValue === null) {
                return -1;
            }

            return advancedFieldSort.direction === "asc"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [players, normalizedSearch, advancedFieldSort]);

    /*
     * ========================================================
     * Normal Sort Handler
     * ========================================================
     */

    const toggleNormalSort = (
        key: BattingStatKey | PitchingStatKey | FieldingStatKey,
        type: PlayerStatsTableType,
    ) => {
        if (type === "bat") {
            const direction = getNextSortDirection(
                batSort.key,
                batSort.direction,
                key as BattingStatKey,
            );

            setBatSort({
                key: direction ? (key as BattingStatKey) : null,
                direction,
            });
        } else if (type === "pitch") {
            const direction = getNextSortDirection(
                pitchSort.key,
                pitchSort.direction,
                key as PitchingStatKey,
            );

            setPitchSort({
                key: direction ? (key as PitchingStatKey) : null,
                direction,
            });
        } else {
            const direction = getNextSortDirection(
                fieldSort.key,
                fieldSort.direction,
                key as FieldingStatKey,
            );

            setFieldSort({
                key: direction ? (key as FieldingStatKey) : null,
                direction,
            });
        }
    };

    /*
     * ========================================================
     * Advanced Stats Content
     * ========================================================
     */

    const AdvancedStatsContent = () => {
        return (
            <div className="space-y-4">
                {/* Advanced Sub Navigation */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Advanced</span>
                    </div>

                    <div className="h-4 w-px bg-gray-200" />

                    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setAdvancedTab("advanced-bat")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                                advancedTab === "advanced-bat"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            }`}
                        >
                            <Trophy className="h-3.5 w-3.5" />
                            <span>Batting</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setAdvancedTab("advanced-pitch")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                                advancedTab === "advanced-pitch"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            }`}
                        >
                            <Crosshair className="h-3.5 w-3.5" />
                            <span>Pitching</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setAdvancedTab("advanced-field")}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                                advancedTab === "advanced-field"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            }`}
                        >
                            <Shield className="h-3.5 w-3.5" />
                            <span>Fielding</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Table */}
                {advancedTab === "advanced-bat" && (
                    <StatsTableCard
                        title="Advanced Batting"
                        description="Detailed offensive and baserunning statistics"
                        icon={<Trophy className="h-5 w-5" />}
                        count={advancedBatters.length}
                    >
                        <AdvancedStatsTable
                            playerList={advancedBatters}
                            stats={ADVANCED_BATTING_STATS}
                            sort={advancedBatSort}
                            freeAgents={freeAgents}
                            onPlayerClick={handlePlayerClick}
                            onSort={(key) => {
                                setAdvancedBatSort((current) => {
                                    const direction = getNextSortDirection(
                                        current.key,
                                        current.direction,
                                        key,
                                    );

                                    return {
                                        key: direction ? key : null,
                                        direction,
                                    };
                                });
                            }}
                        />
                    </StatsTableCard>
                )}

                {advancedTab === "advanced-pitch" && (
                    <StatsTableCard
                        title="Advanced Pitching"
                        description="Detailed pitching performance statistics"
                        icon={<Crosshair className="h-5 w-5" />}
                        count={advancedPitchers.length}
                    >
                        <AdvancedStatsTable
                            playerList={advancedPitchers}
                            stats={ADVANCED_PITCHING_STATS}
                            sort={advancedPitchSort}
                            freeAgents={freeAgents}
                            onPlayerClick={handlePlayerClick}
                            onSort={(key) => {
                                setAdvancedPitchSort((current) => {
                                    const direction = getNextSortDirection(
                                        current.key,
                                        current.direction,
                                        key,
                                    );

                                    return {
                                        key: direction ? key : null,
                                        direction,
                                    };
                                });
                            }}
                        />
                    </StatsTableCard>
                )}

                {advancedTab === "advanced-field" && (
                    <StatsTableCard
                        title="Advanced Fielding"
                        description="Detailed defensive statistics"
                        icon={<Shield className="h-5 w-5" />}
                        count={advancedFielders.length}
                    >
                        <AdvancedStatsTable
                            playerList={advancedFielders}
                            stats={ADVANCED_FIELDING_STATS}
                            sort={advancedFieldSort}
                            freeAgents={freeAgents}
                            onPlayerClick={handlePlayerClick}
                            onSort={(key) => {
                                setAdvancedFieldSort((current) => {
                                    const direction = getNextSortDirection(
                                        current.key,
                                        current.direction,
                                        key,
                                    );

                                    return {
                                        key: direction ? key : null,
                                        direction,
                                    };
                                });
                            }}
                        />
                    </StatsTableCard>
                )}
            </div>
        );
    };

    /*
     * ========================================================
     * Render
     * ========================================================
     */

    return (
        <div className="min-h-screen bg-slate-50">
            {showCard && selectedPlayer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={closePlayerCard}
                >
                    <div
                        className="max-h-[95vh] w-full max-w-[1000px] overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <PlayerCardTabs
                            initialPlayer={selectedPlayer}
                            players={players}
                            onClose={closePlayerCard}
                        />
                    </div>
                </div>
            )}

            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />

                                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                                    League Statistics
                                </span>
                            </div>

                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                {freeAgents ? "Free Agents" : "Players"}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                                Browse player statistics, compare performance,
                                and view detailed player profiles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Tabs defaultValue="bat" className="w-full">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <TabsList className="grid h-auto w-full grid-cols-4 bg-white p-1 shadow-sm sm:w-auto">
                            <TabsTrigger
                                value="bat"
                                className="gap-2 px-4 py-2.5 text-xs sm:text-sm"
                            >
                                <Trophy className="h-4 w-4" />
                                <span>Batting</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="pitch"
                                className="gap-2 px-4 py-2.5 text-xs sm:text-sm"
                            >
                                <Crosshair className="h-4 w-4" />
                                <span>Pitching</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="field"
                                className="gap-2 px-4 py-2.5 text-xs sm:text-sm"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Fielding</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="advanced"
                                className="gap-2 px-4 py-2.5 text-xs sm:text-sm"
                            >
                                <BarChart3 className="h-4 w-4" />
                                <span>Advanced</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full lg:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search players..."
                                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="bat" className="mt-0">
                        <StatsTableCard
                            title="Batting Statistics"
                            description="Offensive performance and production"
                            icon={<Trophy className="h-5 w-5" />}
                            count={filteredBatters.length}
                        >
                            <PlayerStatsTable
                                type="bat"
                                playerList={filteredBatters}
                                freeAgents={freeAgents}
                                batSort={batSort}
                                pitchSort={pitchSort}
                                fieldSort={fieldSort}
                                onSort={toggleNormalSort}
                                onPlayerClick={handlePlayerClick}
                            />
                        </StatsTableCard>
                    </TabsContent>

                    <TabsContent value="pitch" className="mt-0">
                        <StatsTableCard
                            title="Pitching Statistics"
                            description="Pitching performance and workload"
                            icon={<Crosshair className="h-5 w-5" />}
                            count={filteredPitchers.length}
                        >
                            <PlayerStatsTable
                                type="pitch"
                                playerList={filteredPitchers}
                                freeAgents={freeAgents}
                                batSort={batSort}
                                pitchSort={pitchSort}
                                fieldSort={fieldSort}
                                onSort={toggleNormalSort}
                                onPlayerClick={handlePlayerClick}
                            />
                        </StatsTableCard>
                    </TabsContent>

                    <TabsContent value="field" className="mt-0">
                        <StatsTableCard
                            title="Fielding Statistics"
                            description="Defensive performance and put outs"
                            icon={<Shield className="h-5 w-5" />}
                            count={filteredFielders.length}
                        >
                            <PlayerStatsTable
                                type="field"
                                playerList={filteredFielders}
                                freeAgents={freeAgents}
                                batSort={batSort}
                                pitchSort={pitchSort}
                                fieldSort={fieldSort}
                                onSort={toggleNormalSort}
                                onPlayerClick={handlePlayerClick}
                            />
                        </StatsTableCard>
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-0">
                        <AdvancedStatsContent />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
