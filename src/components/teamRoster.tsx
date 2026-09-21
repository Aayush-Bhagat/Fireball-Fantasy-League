"use client";

import React, { use, useState } from "react";

import { TeamRosterDto } from "@/dtos/teamDtos";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerCardTabs from "./playerCardTabs";

interface Props {
    rosterData: Promise<TeamRosterDto>;
}

export default function TeamRoster({ rosterData }: Props) {
    const [selectedPlayer, setSelectedPlayer] =
        useState<PlayerWithStatsDto | null>(null);

    const [showCard, setShowCard] = useState(false);

    const { roster } = use(rosterData);

    const handlePlayerClick = (player: PlayerWithStatsDto) => {
        setSelectedPlayer(player);
        setShowCard(true);
    };

    const closePlayerCard = () => {
        setShowCard(false);
        setSelectedPlayer(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* =========================================================
                PLAYER CARD MODAL
            ========================================================= */}

            {showCard && selectedPlayer && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-950/70
                        p-3
                        backdrop-blur-sm
                        sm:p-5
                    "
                    onClick={closePlayerCard}
                >
                    <div
                        className="
                            relative
                            w-full
                            max-w-[900px]
                        "
                        onClick={(event) => event.stopPropagation()}
                    >
                        <PlayerCardTabs
                            initialPlayer={selectedPlayer}
                            players={roster}
                            onClose={closePlayerCard}
                        />
                    </div>
                </div>
            )}

            {/* =========================================================
                ROSTER TABLE
            ========================================================= */}

            <div className="flex justify-center px-6">
                <div className="w-full max-w-6xl">
                    <h2 className="mb-4 text-2xl font-semibold text-blue-800">
                        Team
                    </h2>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        <table className="w-full table-auto text-left">
                            <thead className="bg-blue-50 text-blue-800">
                                <tr>
                                    <th className="px-6 py-3">Player</th>

                                    <th className="px-6 py-3">AVG</th>

                                    <th className="px-6 py-3">HR</th>

                                    <th className="px-6 py-3">RBI</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {roster.map((player, index) => (
                                    <tr
                                        key={player.id ?? index}
                                        className="
                                            cursor-pointer
                                            transition
                                            hover:bg-gray-50
                                        "
                                        onClick={() =>
                                            handlePlayerClick(player)
                                        }
                                    >
                                        {/* Player */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {player.image && (
                                                    <img
                                                        src={player.image}
                                                        alt={player.name}
                                                        className="
                                                            h-10
                                                            w-10
                                                            rounded-full
                                                            border
                                                            border-gray-300
                                                            object-contain
                                                        "
                                                        style={{
                                                            transform:
                                                                "scaleX(-1)",
                                                        }}
                                                    />
                                                )}

                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {player.name}
                                                    </div>

                                                    {player.position && (
                                                        <div className="text-xs text-gray-500">
                                                            {player.position}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* AVG */}
                                        <td className="px-6 py-4 font-mono">
                                            {player.stats.battingAverage.toFixed(
                                                3,
                                            )}
                                        </td>

                                        {/* HR */}
                                        <td className="px-6 py-4 font-mono">
                                            {player.stats.homeRuns}
                                        </td>

                                        {/* RBI */}
                                        <td className="px-6 py-4 font-mono">
                                            {player.stats.rbis}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
