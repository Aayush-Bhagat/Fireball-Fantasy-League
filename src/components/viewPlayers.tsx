"use client";
import React, { useState, useMemo } from "react";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerCard from "./playerCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    players: PlayerWithStatsDto[];
};

type BattingStatKey = "battingAverage" | "homeRuns" | "hits" | "rbis";
type PitchingStatKey = "era" | "runsAllowed" | "strikeouts" | "inningsPitched";

type SortDirection = "desc" | "asc" | null;

export default function ViewPlayers({ players }: Props) {
    const [selectedPlayer, setSelectedPlayer] =
        useState<PlayerWithStatsDto | null>(null);
    const [showCard, setShowCard] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [batSort, setBatSort] = useState<{
        key: BattingStatKey | null;
        direction: SortDirection;
    }>({
        key: null,
        direction: null,
    });
    const [pitchSort, setPitchSort] = useState<{
        key: PitchingStatKey | null;
        direction: SortDirection;
    }>({
        key: null,
        direction: null,
    });

    const handlePlayerClick = (player: PlayerWithStatsDto) => {
        setSelectedPlayer(player);
        setShowCard(true);
    };

    const defaultBatters = useMemo(() => {
        const weights = { hr: 2, rbi: 1, avg: 2.5 };

        const maxHR = Math.max(...players.map((p) => p.stats?.homeRuns ?? 0));
        const maxRBI = Math.max(...players.map((p) => p.stats?.rbis ?? 0));
        const maxAVG = Math.max(
            ...players.map((p) => p.stats?.battingAverage ?? 0)
        );

        return players
            .filter((p) => p.stats && p.stats.battingAverage !== undefined)
            .map((p) => {
                const { homeRuns = 0, rbis = 0, battingAverage = 0 } = p.stats;
                const normalizedHR = maxHR ? homeRuns / maxHR : 0;
                const normalizedRBI = maxRBI ? rbis / maxRBI : 0;
                const normalizedAVG = maxAVG ? battingAverage / maxAVG : 0;

                const score =
                    normalizedHR * weights.hr +
                    normalizedRBI * weights.rbi +
                    normalizedAVG * weights.avg;

                return { ...p, score };
            })
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({ ...p, rank: index + 1 }));
    }, [players]);

    const defaultPitchers = useMemo(() => {
        const weights = {
            era: -3,
            so: 1.25,
            ip: 1.5,
        };
        return players
            .filter(
                (p) =>
                    p.stats &&
                    p.stats.era !== undefined &&
                    p.stats.inningsPitched > 0
            )
            .map((p) => ({
                ...p,
                score:
                    p.stats.era * weights.era +
                    p.stats.strikeouts * weights.so +
                    p.stats.inningsPitched * weights.ip,
            }))
            .sort((a, b) => b.score - a.score)
            .map((p, index) => ({ ...p, rank: index + 1 }));
    }, [players]);

    const sortedBatters = useMemo(() => {
        if (!batSort.key || !batSort.direction) return defaultBatters;

        const sorted = [...defaultBatters].sort((a, b) => {
            const valA = a.stats[batSort.key!];
            const valB = b.stats[batSort.key!];

            return batSort.direction === "asc" ? valA - valB : valB - valA;
        });

        return sorted.map((p, index) => ({ ...p, rank: index + 1 }));
    }, [defaultBatters, batSort]);

    const sortedPitchers = useMemo(() => {
        if (!pitchSort.key || !pitchSort.direction) return defaultPitchers;

        const sorted = [...defaultPitchers].sort((a, b) => {
            const valA = a.stats[pitchSort.key!];
            const valB = b.stats[pitchSort.key!];

            return pitchSort.direction === "asc" ? valA - valB : valB - valA;
        });

        return sorted.map((p, index) => ({ ...p, rank: index + 1 }));
    }, [defaultPitchers, pitchSort]);

    const filteredBatters = useMemo(
        () =>
            sortedBatters.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [sortedBatters, searchQuery]
    );

    const filteredPitchers = useMemo(
        () =>
            sortedPitchers.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [sortedPitchers, searchQuery]
    );

    const toggleSort = (
        key: BattingStatKey | PitchingStatKey,
        type: "bat" | "pitch"
    ) => {
        const current = type === "bat" ? batSort : pitchSort;
        const newDir: SortDirection =
            current.key !== key
                ? "desc"
                : current.direction === "desc"
                ? "asc"
                : current.direction === "asc"
                ? null
                : "desc";

        if (type === "bat")
            setBatSort({
                key: newDir ? (key as BattingStatKey) : null,
                direction: newDir,
            });
        else
            setPitchSort({
                key: newDir ? (key as PitchingStatKey) : null,
                direction: newDir,
            });
    };

    const renderTableRows = (
        type: "bat" | "pitch",
        playerList: (PlayerWithStatsDto & { rank: number })[]
    ) =>
        playerList.map((player) => (
            <tr
                key={player.rank}
                className="hover:bg-gray-100 transition cursor-pointer"
                onClick={() => handlePlayerClick(player)}
            >
                <td className="px-6 py-4 font-mono text-center">
                    {player.rank}
                </td>
                <td className="px-6 py-4 flex items-center gap-4 text-center">
                    {player.image && (
                        <img
                            src={player.image}
                            alt={player.name}
                            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                            style={{ transform: "scaleX(-1)" }}
                        />
                    )}
                    <span className="font-semibold text-gray-800">
                        {player.name}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        {player.team?.logo && (
                            <img
                                src={player.team.logo}
                                alt={`${player.team.name} logo`}
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                        <span>{player.team?.name}</span>
                    </div>
                </td>

                {type === "bat" ? (
                    <>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.battingAverage.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.homeRuns}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.hits}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.rbis}
                        </td>
                    </>
                ) : (
                    <>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.era.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.runsAllowed}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.strikeouts}
                        </td>
                        <td className="px-6 py-4 font-mono">
                            {player.stats.inningsPitched}
                        </td>
                    </>
                )}
            </tr>
        ));

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {showCard && selectedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative">
                        <PlayerCard player={selectedPlayer} />
                        <button
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
                            onClick={() => setShowCard(false)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-blue-800 tracking-tight">
                    All Players
                </h1>
                <p className="text-gray-600 mt-2">
                    Click on a player to view detailed stats
                </p>
            </div>

            <div className="px-4 md:px-12">
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Search players..."
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="bat" className="w-full">
                    <TabsList className="flex justify-center mb-4">
                        <TabsTrigger
                            value="bat"
                            className="py-2 px-4 text-lg font-semibold"
                        >
                            Top Batters
                        </TabsTrigger>
                        <TabsTrigger
                            value="pitch"
                            className="py-2 px-4 text-lg font-semibold"
                        >
                            Top Pitchers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bat">
                        <div className="mb-2 text-gray-700 font-semibold">
                            Top Batters
                        </div>
                        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                            <table className="w-full table-auto">
                                <thead className="bg-blue-50 text-blue-800 text-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-1/64">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Team
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort(
                                                    "battingAverage",
                                                    "bat"
                                                )
                                            }
                                        >
                                            AVG
                                            {batSort.key === "battingAverage" &&
                                                (batSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort("homeRuns", "bat")
                                            }
                                        >
                                            HR
                                            {batSort.key === "homeRuns" &&
                                                (batSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort("hits", "bat")
                                            }
                                        >
                                            H
                                            {batSort.key === "hits" &&
                                                (batSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort("rbis", "bat")
                                            }
                                        >
                                            RBI
                                            {batSort.key === "rbis" &&
                                                (batSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {renderTableRows("bat", filteredBatters)}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="pitch">
                        <div className="mb-2 text-gray-700 font-semibold">
                            Top Pitchers
                        </div>
                        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                            <table className="w-full table-auto">
                                <thead className="bg-blue-50 text-blue-800 text-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-1/64">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Team
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort("era", "pitch")
                                            }
                                        >
                                            ERA
                                            {pitchSort.key === "era" &&
                                                (pitchSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort(
                                                    "runsAllowed",
                                                    "pitch"
                                                )
                                            }
                                        >
                                            RA
                                            {pitchSort.key === "runsAllowed" &&
                                                (pitchSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort(
                                                    "strikeouts",
                                                    "pitch"
                                                )
                                            }
                                        >
                                            SO
                                            {pitchSort.key === "strikeouts" &&
                                                (pitchSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left w-1/6 cursor-pointer"
                                            onClick={() =>
                                                toggleSort(
                                                    "inningsPitched",
                                                    "pitch"
                                                )
                                            }
                                        >
                                            IP
                                            {pitchSort.key ===
                                                "inningsPitched" &&
                                                (pitchSort.direction === "asc"
                                                    ? " ▲"
                                                    : " ▼")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {renderTableRows("pitch", filteredPitchers)}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
