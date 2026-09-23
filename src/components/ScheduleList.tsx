"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, CalendarDays, Clock3, Ban, MapPin } from "lucide-react";
import { SeasonScheduleDto } from "@/dtos/gameDtos";
import { useRouter } from "next/navigation";
import OddsBadge from "@/components/OddsBadge";
import { cn } from "@/lib/utils";

type Props = {
    schedule: SeasonScheduleDto[];
    currentWeek: number;
};

type Game = SeasonScheduleDto["games"][number];
type Team = Game["team"];

export default function ScheduleList({ schedule, currentWeek }: Props) {
    // Current week is open by default
    const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
        new Set([currentWeek]),
    );

    const toggleWeek = (week: number) => {
        setExpandedWeeks((previous) => {
            const next = new Set(previous);
            if (next.has(week)) next.delete(week);
            else next.add(week);
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
                                <div
                                    className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                        isCurrentWeek
                                            ? "bg-violet-100 text-violet-700"
                                            : "bg-gray-100 text-gray-500",
                                    )}
                                >
                                    <CalendarDays className="h-5 w-5" />
                                </div>

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

                            <div
                                className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-200",
                                    isExpanded && "rotate-180",
                                )}
                            >
                                <ChevronDown className="h-5 w-5" />
                            </div>
                        </button>

                        {/* Games */}
                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-in-out",
                                isExpanded
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0",
                            )}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <div className="space-y-3 border-t border-gray-100 bg-gray-50/50 p-3 sm:space-y-4 sm:p-5">
                                    {games.map((game) => (
                                        <GameCard
                                            key={game.gameId}
                                            game={game}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

/* ====================================================== */
/* Game Card                                               */
/* ====================================================== */

function GameCard({ game }: { game: Game }) {
    const router = useRouter();

    const played = game.teamOutcome !== null;
    const teamWon = game.teamOutcome === "Win";
    const opponentWon = game.opponentOutcome === "Win";
    const hasStadium = !!(game.stadium?.name || game.bannedStadium?.name);

    return (
        <div
            onClick={() => router.push(`/game/${game.gameId}`)}
            className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
        >
            {/* Top bar: date/time + stadiums */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {game.playedAt
                            ? format(new Date(game.playedAt), "EEE, MMM d")
                            : "TBD"}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        {game.playedAt
                            ? format(new Date(game.playedAt), "p")
                            : "TBD"}
                    </span>
                </div>

                {hasStadium && (
                    <div className="flex flex-wrap items-center gap-2">
                        {game.stadium?.name && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-2 py-1 text-[11px] font-bold leading-tight text-green-800">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {game.stadium.name}
                            </span>
                        )}
                        {game.bannedStadium?.name && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2 py-1 text-[11px] font-bold leading-tight text-red-700">
                                <Ban className="h-3 w-3 shrink-0" />
                                <span className=" decoration-red-500 decoration-2">
                                    {game.bannedStadium.name}
                                </span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Body: matchup + score centered, odds on the right */}
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-[180px_1fr_180px] lg:items-center lg:gap-6">
                {/* Left spacer (keeps the matchup centered on large screens) */}
                <div className="hidden lg:block" />

                {/* Matchup (centered) */}
                <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
                        <TeamBlock
                            team={game.team}
                            wins={game.teamWins}
                            losses={game.teamLosses}
                            tag="H"
                            home
                            won={teamWon}
                        />

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold uppercase text-gray-400 sm:h-9 sm:w-9">
                            VS
                        </div>

                        <TeamBlock
                            team={game.opponent}
                            wins={game.opponentWins}
                            losses={game.opponentLosses}
                            tag="A"
                            won={opponentWon}
                        />
                    </div>

                    {played && (
                        <div className="flex justify-center">
                            <span className="rounded-full bg-violet-50 px-4 py-1 text-lg font-extrabold text-violet-700 sm:text-xl">
                                {game.teamScore} - {game.opponentScore}
                            </span>
                        </div>
                    )}
                </div>

                {/* Odds (right) */}
                <div className="flex items-center justify-center border-t border-gray-100 pt-4 empty:hidden lg:justify-end lg:border-t-0 lg:pt-0">
                    {game.odds ? (
                        <OddsBadge
                            odds={game.odds}
                            teamName={game.team.name}
                            teamAbbreviation={game.team.abbreviation}
                            opponentName={game.opponent.name}
                            opponentAbbreviation={game.opponent.abbreviation}
                        />
                    ) : !played ? (
                        <span className="text-xs font-medium text-gray-400">
                            Upcoming
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

/* ====================================================== */
/* Team Block                                              */
/* ====================================================== */

function TeamBlock({
    team,
    wins,
    losses,
    tag,
    home = false,
    won = false,
}: {
    team: Team;
    wins: number;
    losses: number;
    tag: "H" | "A";
    home?: boolean;
    won?: boolean;
}) {
    const router = useRouter();

    const logo = team.logo ? (
        <img
            src={team.logo}
            alt={`${team.name} logo`}
            className={cn(
                "h-10 w-10 shrink-0 rounded-full border-2 object-cover sm:h-12 sm:w-12",
                won ? "border-green-300" : "border-gray-200",
            )}
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/teams/${team.id}`);
            }}
        />
    ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400 sm:h-12 sm:w-12">
            {team.name.charAt(0)}
        </div>
    );

    return (
        <div
            className={cn(
                "flex min-w-0 items-center gap-2.5 sm:gap-3",
                home ? "justify-end" : "justify-start",
            )}
        >
            {!home && logo}

            <div className={cn("min-w-0", home ? "text-right" : "text-left")}>
                <div
                    className={cn(
                        "flex min-w-0 items-center gap-1 text-sm sm:text-base",
                        home ? "justify-end" : "justify-start",
                        won
                            ? "font-extrabold text-gray-950"
                            : "font-semibold text-gray-900",
                    )}
                >
                    <span className="truncate">{team.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-gray-400">
                        ({tag})
                    </span>
                </div>

                <div className="mt-0.5 text-[11px] font-medium text-gray-400">
                    {wins} - {losses}
                </div>
            </div>

            {home && logo}
        </div>
    );
}
