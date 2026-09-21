"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, CalendarDays, Clock3 } from "lucide-react";
import { SeasonScheduleDto } from "@/dtos/gameDtos";
import { useRouter } from "next/navigation";
import OddsBadge from "@/components/OddsBadge";

type Props = {
    schedule: SeasonScheduleDto[];
    currentWeek: number;
};

export default function ScheduleList({ schedule, currentWeek }: Props) {
    const router = useRouter();

    // Current week is open by default
    const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
        new Set([currentWeek]),
    );

    const toggleWeek = (week: number) => {
        setExpandedWeeks((previous) => {
            const next = new Set(previous);

            if (next.has(week)) {
                next.delete(week);
            } else {
                next.add(week);
            }

            return next;
        });
    };

    return (
        <div className="space-y-4">
            {schedule.map(({ week, games }) => {
                const isExpanded = expandedWeeks.has(week);
                const isCurrentWeek = week === currentWeek;

                return (
                    <section
                        key={week}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                        {/* Week Header */}
                        <button
                            type="button"
                            onClick={() => toggleWeek(week)}
                            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                {/* Week Icon */}
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        isCurrentWeek
                                            ? "bg-violet-100 text-violet-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    <CalendarDays className="h-5 w-5" />
                                </div>

                                {/* Week Info */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                                            Week {week}
                                        </h2>

                                        {isCurrentWeek && (
                                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {games.length}{" "}
                                        {games.length === 1 ? "game" : "games"}
                                    </p>
                                </div>
                            </div>

                            {/* Chevron */}
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                            >
                                <ChevronDown className="h-5 w-5" />
                            </div>
                        </button>

                        {/* Games */}
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${
                                isExpanded
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <div className="border-t border-gray-100 bg-gray-50/50 p-3 sm:p-5">
                                    <div className="space-y-3 sm:space-y-4">
                                        {games.map((game) => (
                                            <div
                                                key={game.gameId}
                                                onClick={() =>
                                                    router.push(
                                                        `/game/${game.gameId}`,
                                                    )
                                                }
                                                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-5"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                                    {/* Date / Time */}
                                                    <div className="flex shrink-0 items-center justify-center gap-4 border-b border-gray-100 pb-3 lg:w-[190px] lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                            <CalendarDays className="h-3.5 w-3.5" />

                                                            {game.playedAt
                                                                ? format(
                                                                      new Date(
                                                                          game.playedAt,
                                                                      ),
                                                                      "EEE, MMM d",
                                                                  )
                                                                : "TBD"}
                                                        </div>

                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                            <Clock3 className="h-3.5 w-3.5" />

                                                            {game.playedAt
                                                                ? format(
                                                                      new Date(
                                                                          game.playedAt,
                                                                      ),
                                                                      "p",
                                                                  )
                                                                : "TBD"}
                                                        </div>
                                                    </div>

                                                    {/* Matchup */}
                                                    <div className="flex flex-1 items-center justify-center gap-2 sm:gap-5">
                                                        {/* Team */}
                                                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                                                            <div className="min-w-0 text-right">
                                                                <div className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                                                    {
                                                                        game
                                                                            .team
                                                                            .name
                                                                    }
                                                                </div>

                                                                <div className="mt-0.5 text-[11px] font-medium text-gray-400">
                                                                    {
                                                                        game.teamWins
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        game.teamLosses
                                                                    }
                                                                </div>
                                                            </div>

                                                            {game.team.logo ? (
                                                                <img
                                                                    src={
                                                                        game
                                                                            .team
                                                                            .logo
                                                                    }
                                                                    alt={`${game.team.name} logo`}
                                                                    className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover sm:h-11 sm:w-11"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        router.push(
                                                                            `/teams/${game.team.id}`,
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400 sm:h-11 sm:w-11">
                                                                    {game.team.name.charAt(
                                                                        0,
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* VS */}
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold uppercase text-gray-400 sm:h-9 sm:w-9">
                                                            VS
                                                        </div>

                                                        {/* Opponent */}
                                                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                                            {game.opponent
                                                                .logo ? (
                                                                <img
                                                                    src={
                                                                        game
                                                                            .opponent
                                                                            .logo
                                                                    }
                                                                    alt={`${game.opponent.name} logo`}
                                                                    className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover sm:h-11 sm:w-11"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        router.push(
                                                                            `/teams/${game.opponent.id}`,
                                                                        );
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400 sm:h-11 sm:w-11">
                                                                    {game.opponent.name.charAt(
                                                                        0,
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                                                                    {
                                                                        game
                                                                            .opponent
                                                                            .name
                                                                    }
                                                                </div>

                                                                <div className="mt-0.5 text-[11px] font-medium text-gray-400">
                                                                    {
                                                                        game.opponentWins
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        game.opponentLosses
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Odds / Score */}
                                                    <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-t border-gray-100 pt-3 lg:w-[170px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
                                                        {game.odds && (
                                                            <OddsBadge
                                                                odds={game.odds}
                                                                teamName={
                                                                    game.team
                                                                        .name
                                                                }
                                                                teamAbbreviation={
                                                                    game.team
                                                                        .abbreviation
                                                                }
                                                                opponentName={
                                                                    game
                                                                        .opponent
                                                                        .name
                                                                }
                                                                opponentAbbreviation={
                                                                    game
                                                                        .opponent
                                                                        .abbreviation
                                                                }
                                                            />
                                                        )}

                                                        {game.teamOutcome !==
                                                            null && (
                                                            <span className="text-sm font-bold text-violet-600 sm:text-base">
                                                                {game.teamScore}{" "}
                                                                -{" "}
                                                                {
                                                                    game.opponentScore
                                                                }
                                                            </span>
                                                        )}

                                                        {game.teamOutcome ===
                                                            null &&
                                                            !game.odds && (
                                                                <span className="text-xs font-medium text-gray-400">
                                                                    Upcoming
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
