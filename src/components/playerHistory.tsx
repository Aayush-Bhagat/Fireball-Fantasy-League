"use client";

import React from "react";
import { getPlayerHistory } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight, Trophy, Repeat2 } from "lucide-react";
import { format } from "date-fns";

type Props = {
    player: string;
};

export default function PlayerHistory({ player }: Props) {
    const { data: playerHistory, isLoading } = useQuery({
        queryKey: ["player-history", player],
        queryFn: async () => {
            const res = await getPlayerHistory(player);
            return res.history;
        },
    });

    const sortedHistory = [...(playerHistory ?? [])].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Career History
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Draft and transaction history
                    </p>
                </div>

                {sortedHistory.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                        {sortedHistory.length}{" "}
                        {sortedHistory.length === 1 ? "Event" : "Events"}
                    </div>
                )}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-7 h-7 animate-spin mb-2" />
                    <p className="text-sm">Loading career history...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Repeat2 className="w-5 h-5 text-gray-400" />
                    </div>

                    <p className="font-semibold text-gray-700">
                        No history available
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                        No draft or transaction history has been recorded.
                    </p>
                </div>
            )}

            {/* Timeline */}
            {!isLoading && sortedHistory.length > 0 && (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-200" />

                    <div className="space-y-4">
                        {sortedHistory.map((history, i) => {
                            const isDraft = history.type === "Draft";

                            return (
                                <div
                                    key={i}
                                    className="relative flex gap-4 group"
                                >
                                    {/* Timeline Icon */}
                                    <div
                                        className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                                            isDraft
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-purple-100 text-purple-600"
                                        }`}
                                    >
                                        {isDraft ? (
                                            <Trophy className="w-4 h-4" />
                                        ) : (
                                            <Repeat2 className="w-4 h-4" />
                                        )}
                                    </div>

                                    {/* Event Card */}
                                    <div className="flex-1 min-w-0">
                                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
                                            {/* Event Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            isDraft
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-purple-50 text-purple-700"
                                                        }`}
                                                    >
                                                        {isDraft
                                                            ? "DRAFT"
                                                            : "TRADE"}
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        {format(
                                                            new Date(
                                                                history.createdAt,
                                                            ),
                                                            "MMM d, yyyy",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Event Details */}
                                            {isDraft ? (
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-gray-900">
                                                            Drafted
                                                        </span>{" "}
                                                        by{" "}
                                                        <span className="font-bold text-blue-700">
                                                            {history.team.name}
                                                        </span>
                                                    </p>

                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                                                            <span className="text-xs text-gray-500">
                                                                Round
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {
                                                                    history.draftRound
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                                                            <span className="text-xs text-gray-500">
                                                                Pick
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {
                                                                    history.draftPick
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Transferred to
                                                        </p>

                                                        <p className="text-sm font-bold text-purple-700">
                                                            {history.team.name}
                                                        </p>
                                                    </div>

                                                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
