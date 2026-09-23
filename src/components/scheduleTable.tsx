"use client";

import * as React from "react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getWeeklySchedule } from "@/requests/schedule";
import { format } from "date-fns";
import { GameResponseDto } from "@/dtos/gameDtos";
import { useQuery } from "@tanstack/react-query";
import ScheduleTableSkeleton from "@/components/loaders/ScheduleTableSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OddsBadge from "@/components/OddsBadge";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock3, Trophy, CalendarDays } from "lucide-react";

type Props = {
    gamesData: Promise<GameResponseDto>;
};

export default function ScheduleTable({ gamesData }: Props) {
    const [selectedWeek, setSelectedWeek] = useState("current");
    const router = useRouter();

    const { games } = React.use(gamesData);

    const { data: schedule, isLoading } = useQuery({
        queryKey: ["weekly-schedule", selectedWeek],
        queryFn: async () => {
            const res = await getWeeklySchedule(selectedWeek, "current");

            return res.games;
        },
        initialData: selectedWeek === "current" ? games : undefined,
        enabled: selectedWeek !== "current",
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return <ScheduleTableSkeleton />;
    }

    const weekDate = schedule?.find((game) => game.playedAt)?.playedAt ?? null;

    const weekStart = weekDate ? new Date(weekDate).getTime() : null;

    const weekNumber = schedule?.at(0)?.week;

    return (
        <div className="mx-auto p-4 space-y-3 font-sans border border-gray-200 rounded-lg shadow-md bg-white">
            {/* ------------------------------------------------ */}
            {/* Header                                           */}
            {/* ------------------------------------------------ */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <CalendarDays className="h-5 w-5 text-violet-700" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            Schedule
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedWeek === "current" && weekNumber != null
                                ? `Week ${weekNumber}`
                                : "Season schedule"}
                        </p>
                    </div>
                </div>
                <Link href="/schedule">
                    <Button
                        size="sm"
                        className="bg-violet-700 hover:bg-violet-800 text-xs"
                    >
                        Full Schedule
                    </Button>
                </Link>
            </div>

            {/* ------------------------------------------------ */}
            {/* Week Selector                                    */}
            {/* ------------------------------------------------ */}

            <div className="flex items-center justify-between gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 text-xs font-medium"
                        >
                            {selectedWeek === "current"
                                ? "Current Week"
                                : selectedWeek === "11"
                                  ? "Play-Ins"
                                  : selectedWeek === "12"
                                    ? "Semifinals"
                                    : selectedWeek === "13"
                                      ? "Finals"
                                      : `Week ${selectedWeek}`}

                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Week</DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuRadioGroup
                            value={selectedWeek}
                            onValueChange={setSelectedWeek}
                        >
                            <DropdownMenuRadioItem value="current">
                                Current Week
                            </DropdownMenuRadioItem>

                            {Array.from({ length: 10 }, (_, i) => (
                                <DropdownMenuRadioItem
                                    key={i}
                                    value={(i + 1).toString()}
                                >
                                    Week {i + 1}
                                </DropdownMenuRadioItem>
                            ))}

                            <DropdownMenuRadioItem value="11">
                                Play-Ins
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="12">
                                Semifinals
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="13">
                                Finals
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {weekStart != null && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 className="h-3.5 w-3.5" />

                        <span>{format(weekStart, "EEE, MMM d")}</span>
                    </div>
                )}
            </div>

            {/* ------------------------------------------------ */}
            {/* Games                                            */}
            {/* ------------------------------------------------ */}

            <div className="space-y-2">
                {schedule && schedule.length > 0 ? (
                    schedule.map((game, index) => {
                        const gameTime =
                            weekStart != null
                                ? format(
                                      weekStart + index * 30 * 60 * 1000,
                                      "p",
                                  )
                                : "TBD";

                        const teamFavored =
                            game.odds != null &&
                            game.odds.teamProb > game.odds.opponentProb;

                        const opponentFavored =
                            game.odds != null &&
                            game.odds.opponentProb > game.odds.teamProb;

                        const gameFinished =
                            game.teamScore != null &&
                            game.opponentScore != null;

                        const teamWon = game.teamOutcome === "Win";

                        const opponentWon = game.opponentOutcome === "Win";

                        return (
                            <div
                                key={game.gameId ?? index}
                                onClick={() =>
                                    router.push(`/game/${game.gameId}`)
                                }
                                className="group cursor-pointer rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {/* Time */}
                                    <div className="w-12 shrink-0 text-center">
                                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                            Time
                                        </div>

                                        <div className="mt-0.5 text-xs font-semibold text-gray-700">
                                            {gameTime}
                                        </div>
                                    </div>

                                    <div className="h-9 w-px bg-gray-200" />

                                    {/* Matchup */}
                                    <div className="min-w-0 flex-1">
                                        {/* Team */}
                                        <TeamRow
                                            name={game.team.name}
                                            logo={game.team.logo}
                                            score={game.teamScore}
                                            win={teamWon}
                                            favored={teamFavored}
                                            away={false}
                                        />

                                        {/* Opponent */}
                                        <TeamRow
                                            name={game.opponent.name}
                                            logo={game.opponent.logo}
                                            score={game.opponentScore}
                                            win={opponentWon}
                                            favored={opponentFavored}
                                            away={true}
                                        />
                                    </div>

                                    {/* Odds / Result */}
                                    <div className="hidden sm:flex w-[100px] shrink-0 items-center justify-center">
                                        {game.odds ? (
                                            <OddsBadge
                                                odds={game.odds}
                                                teamName={game.team.name}
                                                teamAbbreviation={
                                                    game.team.abbreviation
                                                }
                                                opponentName={
                                                    game.opponent.name
                                                }
                                                opponentAbbreviation={
                                                    game.opponent.abbreviation
                                                }
                                                className="justify-center scale-90"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                No odds
                                            </span>
                                        )}
                                    </div>

                                    {/* Result */}
                                    <div className="w-12 shrink-0 text-center">
                                        {gameFinished ? (
                                            <div className="flex flex-col items-center">
                                                <Trophy
                                                    className={cn(
                                                        "h-3.5 w-3.5 mb-0.5",
                                                        teamWon || opponentWon
                                                            ? "text-amber-500"
                                                            : "text-gray-300",
                                                    )}
                                                />

                                                <span className="text-xs font-bold text-gray-800">
                                                    {game.teamScore} -{" "}
                                                    {game.opponentScore}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                                TBD
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Odds */}
                                {game.odds && (
                                    <div className="mt-2 flex sm:hidden justify-center border-t border-gray-100 pt-2">
                                        <OddsBadge
                                            odds={game.odds}
                                            teamName={game.team.name}
                                            teamAbbreviation={
                                                game.team.abbreviation
                                            }
                                            opponentName={game.opponent.name}
                                            opponentAbbreviation={
                                                game.opponent.abbreviation
                                            }
                                            className="justify-center scale-90"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            No games scheduled
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Check another week.
                        </p>
                    </div>
                )}
            </div>

            {/* ------------------------------------------------ */}
            {/* Legend                                           */}
            {/* ------------------------------------------------ */}

            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="font-bold text-orange-500">Y</span>

                    <span>Favored to win</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />

                    <span>Click matchup for details</span>
                </div>
            </div>
        </div>
    );
}

/* ====================================================== */
/* Team Row                                                */
/* ====================================================== */

function TeamRow({
    name,
    logo,
    score,
    win = false,
    favored = false,
    away = false,
}: {
    name: string;
    logo?: string | null;
    score?: number | null;
    win?: boolean;
    favored?: boolean;
    away?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between rounded-md px-2 py-1 transition-colors",
                win ? "bg-green-50" : "bg-transparent",
            )}
        >
            <div
                className={cn(
                    "flex min-w-0 items-center gap-2",
                    away && "flex-row-reverse",
                )}
            >
                {logo ? (
                    <img
                        src={logo}
                        alt={`${name} logo`}
                        className={cn(
                            "h-6 w-6 shrink-0 rounded-full object-cover border",
                            win ? "border-green-200" : "border-gray-200",
                        )}
                    />
                ) : (
                    <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                )}

                <span
                    className={cn(
                        "truncate text-xs",
                        win
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700",
                    )}
                >
                    {name} ({away ? "A" : "H"})
                </span>

                {favored && (
                    <span
                        className="shrink-0 text-[9px] font-bold text-orange-500"
                        title="Favored to win"
                    >
                        Y
                    </span>
                )}
            </div>

            <div className="ml-2 shrink-0">
                {score != null ? (
                    <span
                        className={cn(
                            "text-xs font-bold",
                            win ? "text-green-700" : "text-gray-500",
                        )}
                    >
                        {score}
                    </span>
                ) : (
                    <span className="text-[10px] text-gray-400">—</span>
                )}
            </div>
        </div>
    );
}
