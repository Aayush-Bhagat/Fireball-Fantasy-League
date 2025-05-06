"use client";
import React, { useState } from "react";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerCard from "./playerCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    players: PlayerWithStatsDto[];
};

export default function ViewPlayers({ players }: Props) {
    const [selectedPlayer, setSelectedPlayer] =
        useState<PlayerWithStatsDto | null>(null);
    const [showCard, setShowCard] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handlePlayerClick = (player: PlayerWithStatsDto) => {
        setSelectedPlayer(player);
        setShowCard(true);
    };

    const getTopBatters = (players: PlayerWithStatsDto[]) => {
        return [...players]
            .filter(
                (p) =>
                    p.stats?.battingAverage != null &&
                    (searchQuery === "" ||
                        p.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
            )

            .sort((a, b) => b.stats.battingAverage - a.stats.battingAverage)
            .slice(0);
    };

    const getTopPitchers = (players: PlayerWithStatsDto[]) => {
        return [...players]
            .filter(
                (p) =>
                    p.stats?.era != null &&
                    !(
                        p.stats.era === 0 &&
                        p.stats.runsAllowed === 0 &&
                        p.stats.inningsPitched === 0
                    ) &&
                    (searchQuery === "" ||
                        p.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
            )

            .sort((a, b) => a.stats.era - b.stats.era)
            .slice(0);
    };

    const renderTableRows = (
        type: "bat" | "pitch",
        playerList: PlayerWithStatsDto[]
    ) =>
        playerList.map((player, index) => (
            <tr
                key={index}
                className="hover:bg-gray-100 transition cursor-pointer"
                onClick={() => handlePlayerClick(player)}
            >
                <td className="px-6 py-4 flex items-center gap-4">
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
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search players..."
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="bat" className="w-full">
                    <TabsList className="flex justify-center mb-4">
                        <TabsTrigger
                            value="bat"
                            className="py-2 px-4 text-lg font-semibold text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition"
                        >
                            Top Batters
                        </TabsTrigger>
                        <TabsTrigger
                            value="pitch"
                            className="py-2 px-4 text-lg font-semibold text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition"
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
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Team
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            AVG
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            HR
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            H
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            RBI
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {renderTableRows(
                                        "bat",
                                        getTopBatters(players)
                                    )}
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
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/5">
                                            Team
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            ERA
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            RA
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            SO
                                        </th>
                                        <th className="px-6 py-3 text-left w-1/6">
                                            IP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {renderTableRows(
                                        "pitch",
                                        getTopPitchers(players)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
