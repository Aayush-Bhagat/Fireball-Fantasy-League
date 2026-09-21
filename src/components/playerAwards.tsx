"use client";

import React from "react";
import { getPlayerAwards } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy, Calendar } from "lucide-react";

type Props = {
    player: string;
};

export default function PlayerAwards({ player }: Props) {
    const { data: playerAwards, isLoading } = useQuery({
        queryKey: ["player-awards", player],
        queryFn: async () => {
            const res = await getPlayerAwards(player);
            return res.awards;
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Loading awards...</p>
            </div>
        );
    }

    if (!playerAwards || playerAwards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-14 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-base font-semibold text-gray-800">
                    No Awards Yet
                </h3>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* ================= HEADER ================= */}

            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-amber-600" />
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">
                            Awards
                        </h2>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 ml-10">
                        Career achievements and honors
                    </p>
                </div>

                {/* Total Awards */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                    <Trophy className="w-4 h-4 text-amber-600" />

                    <div className="leading-tight">
                        <p className="text-sm font-bold text-gray-900">
                            {playerAwards.length}
                        </p>

                        <p className="text-[10px] uppercase tracking-wide text-gray-500">
                            Awards
                        </p>
                    </div>
                </div>
            </div>

            {/* ================= AWARDS ================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playerAwards.map((award, i) => {
                    const winCount = award.wins?.length ?? 0;

                    return (
                        <div
                            key={i}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            {/* Decorative background */}

                            <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-amber-50 opacity-70 group-hover:scale-125 transition-transform duration-300" />

                            <div className="relative p-5">
                                {/* ================= TOP ================= */}

                                <div className="flex items-start gap-4">
                                    {/* Award Icon */}

                                    <div className="relative shrink-0">
                                        <div className="absolute inset-0 rounded-xl bg-amber-200/40 blur-md scale-90" />

                                        <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 flex items-center justify-center shadow-sm">
                                            {award.icon ? (
                                                <img
                                                    src={award.icon}
                                                    alt={award.name}
                                                    className="w-14 h-14 object-contain"
                                                />
                                            ) : (
                                                <Trophy className="w-9 h-9 text-amber-500" />
                                            )}
                                        </div>

                                        {/* Win Badge */}

                                        {winCount > 0 && (
                                            <div className="absolute -top-2 -right-2 min-w-7 h-7 px-1.5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                                                <span className="text-[10px] font-bold">
                                                    x{winCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Award Information */}

                                    <div className="min-w-0 flex-1 pt-1">
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-600">
                                            Achievement
                                        </p>

                                        <h3 className="mt-1 text-base font-bold text-gray-900 leading-tight">
                                            {award.name}
                                        </h3>

                                        {winCount > 0 && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Won{" "}
                                                <span className="font-semibold text-gray-700">
                                                    {winCount}
                                                </span>{" "}
                                                {winCount === 1
                                                    ? "time"
                                                    : "times"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ================= DIVIDER ================= */}

                                {winCount > 0 && (
                                    <div className="my-4 border-t border-gray-100" />
                                )}

                                {/* ================= SEASONS ================= */}

                                {winCount > 0 && (
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />

                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                                                Seasons Won
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {award.wins.map((w) => (
                                                <span
                                                    key={w.seasonId}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors group-hover:bg-amber-50 group-hover:border-amber-200"
                                                >
                                                    Season {w.seasonId}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
