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
import {
    calculateBAA,
    calculateEra,
    calculateOBP,
    calculateOBPAgainst,
    calculateOPS,
    calculateOPSAgainst,
    calculateSLG,
    calculateSLGAgainst,
    calculateWHIP,
} from "@/lib/statUtils";

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

    const percentileScore = (
        value: number,
        values: number[],
        higherIsBetter = true,
    ) => {
        if (values.length <= 1) return 100;

        const validValues = values.filter((v) => Number.isFinite(v));

        if (validValues.length <= 1) return 100;

        const sorted = [...validValues].sort((a, b) => a - b);

        // Average percentile for tied values
        const firstIndex = sorted.findIndex((v) => v === value);
        const lastIndex = sorted.findLastIndex((v) => v === value);

        if (firstIndex === -1) {
            // Value isn't exactly present due to floating point differences.
            // Count how many values are below/above it instead.
            const betterCount = higherIsBetter
                ? sorted.filter((v) => v < value).length
                : sorted.filter((v) => v > value).length;

            return (betterCount / (sorted.length - 1)) * 100;
        }

        const averageIndex = (firstIndex + lastIndex) / 2;

        if (higherIsBetter) {
            return (averageIndex / (sorted.length - 1)) * 100;
        }

        return ((sorted.length - 1 - averageIndex) / (sorted.length - 1)) * 100;
    };

    /*
     * ========================================================
     * Default Batting Rankings
     * ========================================================
     */

    const defaultBattingRankings = useMemo(() => {
        const qualifiedPlayers = players.filter((p) => p.stats);

        const getBattingStats = (player: (typeof qualifiedPlayers)[number]) => {
            const s = player.stats!;

            const atBats = s.atBats ?? 0;
            const hits = s.hits ?? 0;
            const walks = s.walksTaken ?? 0;
            const hitByPitch = s.hitByPitch ?? 0;
            const sacFlies = s.sacFlies ?? 0;

            const singles = s.singles ?? 0;
            const doubles = s.doubles ?? 0;
            const triples = s.triples ?? 0;
            const homeRuns = s.homeRuns ?? 0;

            const plateAppearances = s.plateAppearances ?? 0;
            const runs = s.runs ?? 0;
            const rbis = s.rbis ?? 0;

            const battingAverage = atBats > 0 ? hits / atBats : 0;

            const obp =
                calculateOBP(hits, walks, hitByPitch, atBats, sacFlies) ?? 0;

            const slg =
                calculateSLG(
                    hits,
                    singles,
                    doubles,
                    triples,
                    homeRuns,
                    atBats,
                ) ?? 0;

            const ops = calculateOPS(obp, slg) ?? 0;

            // Calculate total bases directly.
            // Do NOT use s.totalBases here.
            const totalBases =
                singles + 2 * doubles + 3 * triples + 4 * homeRuns;

            const tbPerPA =
                plateAppearances > 0 ? totalBases / plateAppearances : 0;

            const rbiPerPA = plateAppearances > 0 ? rbis / plateAppearances : 0;

            const runsPerPA =
                plateAppearances > 0 ? runs / plateAppearances : 0;

            return {
                battingAverage,
                obp,
                slg,
                ops,
                totalBases,
                tbPerPA,
                rbiPerPA,
                runsPerPA,
                plateAppearances,
            };
        };

        const allStats = qualifiedPlayers.map(getBattingStats);

        const normalize = (value: number, values: number[]) => {
            const min = Math.min(...values);
            const max = Math.max(...values);

            // Everyone has the same value.
            if (max === min) {
                return 100;
            }

            return ((value - min) / (max - min)) * 100;
        };

        const opsValues = allStats.map((s) => s.ops);
        const battingAverageValues = allStats.map((s) => s.battingAverage);
        const rbiPerPAValues = allStats.map((s) => s.rbiPerPA);
        const tbPerPAValues = allStats.map((s) => s.tbPerPA);
        const runsPerPAValues = allStats.map((s) => s.runsPerPA);
        const paValues = allStats.map((s) => s.plateAppearances);

        return qualifiedPlayers
            .map((player, index) => {
                const stats = allStats[index];

                const opsScore = normalize(stats.ops, opsValues);

                const battingAverageScore = normalize(
                    stats.battingAverage,
                    battingAverageValues,
                );

                const rbiScore = normalize(stats.rbiPerPA, rbiPerPAValues);

                const tbScore = normalize(stats.tbPerPA, tbPerPAValues);

                const runsScore = normalize(stats.runsPerPA, runsPerPAValues);

                const volumeScore = normalize(stats.plateAppearances, paValues);

                const rankingScore =
                    opsScore * 0.3 +
                    battingAverageScore * 0.25 +
                    rbiScore * 0.15 +
                    tbScore * 0.15 +
                    runsScore * 0.1 +
                    volumeScore * 0.05;

                return {
                    ...player,
                    rankingScore,
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
        const qualifiedPlayers = players.filter((p) => {
            if (!p.stats) return false;

            const outsPitched = p.stats.outsPitched ?? 0;
            const gamesPlayed = p.stats.gamesPlayed ?? 0;

            // Must have pitched at least 1 out and meet the IP >= games played requirement
            return outsPitched > 0 && outsPitched >= gamesPlayed * 3;
        });

        const getValues = (
            getter: (p: (typeof qualifiedPlayers)[number]) => number,
        ) => qualifiedPlayers.map((p) => getter(p));

        const getPitchingStats = (
            player: (typeof qualifiedPlayers)[number],
        ) => {
            const s = player.stats!;

            const runsAllowed = s.runsAllowed ?? 0;
            const outsPitched = s.outsPitched ?? 0;
            const walks = s.walks ?? 0;
            const hitsAllowed = s.hitsAllowed ?? 0;
            const beanBalls = s.beanBalls ?? 0;

            const atBatsAgainst =
                s.battersFaced !== null &&
                s.walks !== null &&
                s.beanBalls !== null
                    ? Math.max(0, s.battersFaced - s.walks - s.beanBalls)
                    : null;

            const singlesAllowed = s.singlesAllowed ?? 0;
            const doublesAllowed = s.doublesAllowed ?? 0;
            const triplesAllowed = s.triplesAllowed ?? 0;
            const homeRunsAllowed = s.homeRunsAllowed ?? 0;

            // Derived pitching stats from statUtils
            const era = calculateEra(runsAllowed, outsPitched);

            const whip = calculateWHIP(walks, hitsAllowed, outsPitched);

            const baa = calculateBAA(hitsAllowed, atBatsAgainst);

            const obpAgainst = calculateOBPAgainst(
                hitsAllowed,
                walks,
                atBatsAgainst,
                beanBalls,
            );

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
                era,
                whip: whip ?? 0,
                baa: baa ?? 0,
                obpAgainst: obpAgainst ?? 0,
                slgAgainst: slgAgainst ?? 0,
                opsAgainst: opsAgainst ?? 0,
            };
        };

        const scores = {
            era: getValues((p) => getPitchingStats(p).era),

            whip: getValues((p) => getPitchingStats(p).whip),

            baa: getValues((p) => getPitchingStats(p).baa),

            obpAgainst: getValues((p) => getPitchingStats(p).obpAgainst),

            slgAgainst: getValues((p) => getPitchingStats(p).slgAgainst),

            kRate: getValues((p) => {
                const s = p.stats!;
                const battersFaced = s.battersFaced ?? 0;

                return battersFaced > 0
                    ? (s.strikeouts ?? 0) / battersFaced
                    : 0;
            }),

            bbRate: getValues((p) => {
                const s = p.stats!;
                const battersFaced = s.battersFaced ?? 0;

                return battersFaced > 0 ? (s.walks ?? 0) / battersFaced : 0;
            }),

            inningsPitched: getValues((p) => p.stats!.inningsPitched ?? 0),
        };

        return qualifiedPlayers
            .map((player) => {
                const s = player.stats!;
                const derived = getPitchingStats(player);

                const inningsPitched = s.inningsPitched ?? 0;

                const battersFaced = Math.max(s.battersFaced ?? 0, 1);

                const strikeouts = s.strikeouts ?? 0;
                const walks = s.walks ?? 0;

                const kRate = strikeouts / battersFaced;

                const bbRate = walks / battersFaced;

                // --------------------------------
                // 40% - Run Prevention
                // --------------------------------
                const runPreventionScore =
                    percentileScore(derived.era, scores.era, false) * 0.6 +
                    percentileScore(derived.whip, scores.whip, false) * 0.4;

                // --------------------------------
                // 5% - Strikeout Dominance
                //
                // Strikeouts are rare in this league,
                // so they are treated as a small bonus.
                // --------------------------------
                const strikeoutScore = percentileScore(
                    kRate,
                    scores.kRate,
                    true,
                );

                // --------------------------------
                // 10% - Control
                // --------------------------------
                const controlScore = percentileScore(
                    bbRate,
                    scores.bbRate,
                    false,
                );

                // --------------------------------
                // 30% - Contact Suppression
                // --------------------------------
                const contactScore =
                    percentileScore(derived.baa, scores.baa, false) * 0.4 +
                    percentileScore(
                        derived.obpAgainst,
                        scores.obpAgainst,
                        false,
                    ) *
                        0.3 +
                    percentileScore(
                        derived.slgAgainst,
                        scores.slgAgainst,
                        false,
                    ) *
                        0.3;

                // --------------------------------
                // 15% - Volume
                // --------------------------------
                const volumeScore = percentileScore(
                    inningsPitched,
                    scores.inningsPitched,
                    true,
                );

                // --------------------------------
                // Final Ranking Score
                //
                // Run Prevention:       40%
                // Contact Suppression:  30%
                // Volume:               15%
                // Control:              10%
                // Strikeouts:            5%
                // --------------------------------
                const rankingScore =
                    runPreventionScore * 0.4 +
                    contactScore * 0.3 +
                    volumeScore * 0.15 +
                    controlScore * 0.1 +
                    strikeoutScore * 0.05;

                return {
                    ...player,
                    rankingScore,
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
        const qualifiedPlayers = players.filter(
            (p) =>
                p.stats &&
                (p.stats.outs ?? 0) +
                    (p.stats.assist ?? 0) +
                    (p.stats.fieldingErrors ?? 0) >
                    0,
        );

        const getFieldingStats = (
            player: (typeof qualifiedPlayers)[number],
        ) => {
            const s = player.stats!;

            const putouts = s.outs ?? 0;
            const assists = s.assist ?? 0;

            const fieldingErrors = s.fieldingErrors ?? 0;

            const fieldingChances = putouts + assists + fieldingErrors;

            const errorRate =
                fieldingChances > 0 ? fieldingErrors / fieldingChances : 0;

            return {
                putouts,
                assists,
                fieldingErrors,
                fieldingChances,
                errorRate,
            };
        };

        const allStats = qualifiedPlayers.map(getFieldingStats);

        const normalize = (
            value: number,
            values: number[],
            higherIsBetter = true,
        ) => {
            const min = Math.min(...values);
            const max = Math.max(...values);

            if (max === min) {
                return 100;
            }

            const score = higherIsBetter
                ? ((value - min) / (max - min)) * 100
                : ((max - value) / (max - min)) * 100;

            return score;
        };

        const putoutValues = allStats.map((s) => s.putouts);

        const assistValues = allStats.map((s) => s.assists);

        const errorRateValues = allStats.map((s) => s.errorRate);

        return qualifiedPlayers
            .map((player, index) => {
                const stats = allStats[index];

                const putoutScore = normalize(
                    stats.putouts,
                    putoutValues,
                    true,
                );

                const assistScore = normalize(
                    stats.assists,
                    assistValues,
                    true,
                );

                const errorScore = normalize(
                    stats.errorRate,
                    errorRateValues,
                    false,
                );

                const rankingScore =
                    putoutScore * 0.4 + assistScore * 0.35 + errorScore * 0.25;

                return {
                    ...player,
                    rankingScore,
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
        const filtered = defaultBattingRankings.filter((player) =>
            player.name.toLowerCase().includes(normalizedSearch),
        );

        const sortKey = advancedBatSort.key;

        // No column selected = use batting ranking algorithm
        if (!sortKey || !advancedBatSort.direction) {
            return filtered;
        }

        // User selected an advanced stat = override ranking
        return [...filtered].sort((a, b) => {
            const aValue = getAdvancedStatValue(a, sortKey);
            const bValue = getAdvancedStatValue(b, sortKey);

            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            return advancedBatSort.direction === "asc"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [defaultBattingRankings, normalizedSearch, advancedBatSort]);
    /*
     * ========================================================
     * Advanced Pitchers
     * ========================================================
     */

    const advancedPitchers = useMemo(() => {
        const filtered = defaultPitchingRankings.filter((player) =>
            player.name.toLowerCase().includes(normalizedSearch),
        );

        const sortKey = advancedPitchSort.key;

        // No column selected = use pitching ranking algorithm
        if (!sortKey || !advancedPitchSort.direction) {
            return filtered;
        }

        // User selected an advanced stat = override ranking
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
    }, [defaultPitchingRankings, normalizedSearch, advancedPitchSort]);

    /*
     * ========================================================
     * Advanced Fielders
     * ========================================================
     */

    const advancedFielders = useMemo(() => {
        const filtered = defaultFieldingRankings.filter((player) =>
            player.name.toLowerCase().includes(normalizedSearch),
        );

        const sortKey = advancedFieldSort.key;

        // No column selected = use fielding ranking algorithm
        if (!sortKey || !advancedFieldSort.direction) {
            return filtered;
        }

        // User selected an advanced stat = override ranking
        return [...filtered].sort((a, b) => {
            const aValue = getAdvancedStatValue(a, sortKey);
            const bValue = getAdvancedStatValue(b, sortKey);

            if (aValue === null && bValue === null) return 0;
            if (aValue === null) return 1;
            if (bValue === null) return -1;

            return advancedFieldSort.direction === "asc"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [defaultFieldingRankings, normalizedSearch, advancedFieldSort]);

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
