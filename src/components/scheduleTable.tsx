"use client";

import * as React from "react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
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
import {
    ChevronDown,
    CalendarDays,
    MapPin,
    Ban,
    Moon,
    Sun,
} from "lucide-react";
type Props = {
    gamesData: Promise<GameResponseDto>;
};

const WEEK_LABELS: Record<string, string> = {
    current: "Current Week",
    "11": "Play-Ins",
    "12": "Semifinals",
    "13": "Finals",
};

const weekLabel = (w: string) => WEEK_LABELS[w] ?? `Week ${w}`;

const WEEK_OPTIONS = [
    "current",
    ...Array.from({ length: 13 }, (_, i) => String(i + 1)),
];

export default function ScheduleTable({ gamesData }: Props) {
    const [selectedWeek, setSelectedWeek] = useState("current");
    const router = useRouter();
    const { games } = React.use(gamesData);

    const { data: schedule, isLoading } = useQuery({
        queryKey: ["weekly-schedule", selectedWeek],
        queryFn: async () =>
            (await getWeeklySchedule(selectedWeek, "current")).games,
        initialData: selectedWeek === "current" ? games : undefined,
        enabled: selectedWeek !== "current",
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) return <ScheduleTableSkeleton />;

    const weekDate = schedule?.find((g) => g.playedAt)?.playedAt ?? null;
    const weekStart = weekDate ? new Date(weekDate).getTime() : null;
    const weekNumber = schedule?.at(0)?.week;

    return (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 font-sans shadow-md">
            {/* Header + week selector */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                        <CalendarDays className="h-4 w-4 text-violet-700" />
                    </div>
                    <div className="leading-tight">
                        <h2 className="text-lg font-extrabold tracking-tight text-gray-950">
                            Schedule
                        </h2>
                        <p className="text-xs font-medium text-gray-500">
                            {selectedWeek === "current" && weekNumber != null
                                ? `Week ${weekNumber}`
                                : "Season schedule"}
                            {weekStart != null &&
                                ` · ${format(weekStart, "EEE, MMM d")}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 border-violet-200 px-2 text-xs font-semibold text-gray-800"
                            >
                                {weekLabel(selectedWeek)}
                                <ChevronDown className="h-3 w-3 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44">
                            <DropdownMenuRadioGroup
                                value={selectedWeek}
                                onValueChange={setSelectedWeek}
                            >
                                {WEEK_OPTIONS.map((w) => (
                                    <DropdownMenuRadioItem key={w} value={w}>
                                        {weekLabel(w)}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/schedule">
                        <Button
                            size="sm"
                            className="h-7 bg-violet-700 px-2 text-xs font-semibold hover:bg-violet-800"
                        >
                            Full Schedule
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Games */}
            <div className="space-y-1.5">
                {schedule && schedule.length > 0 ? (
                    schedule.map((game, index) => {
                        const gameTime =
                            weekStart != null
                                ? format(
                                      weekStart + index * 30 * 60 * 1000,
                                      "p",
                                  )
                                : "TBD";
                        const { odds } = game;
                        const teamFavored =
                            !!odds && odds.teamProb > odds.opponentProb;
                        const opponentFavored =
                            !!odds && odds.opponentProb > odds.teamProb;

                        const oddsBadge = odds ? (
                            <OddsBadge
                                odds={odds}
                                teamName={game.team.name}
                                teamAbbreviation={game.team.abbreviation}
                                opponentName={game.opponent.name}
                                opponentAbbreviation={
                                    game.opponent.abbreviation
                                }
                                className="justify-center scale-100"
                            />
                        ) : (
                            <span className="text-[10px] text-gray-400">
                                No odds
                            </span>
                        );

                        const banner = game.stadium?.banner;
                        const stadiumTime = game.stadiumTime?.toLowerCase();
                        const isDay = stadiumTime === "day";
                        const isNight = stadiumTime === "night";

                        return (
                            <div
                                key={game.gameId ?? index}
                                onClick={() =>
                                    router.push(`/game/${game.gameId}`)
                                }
                                className="flex h-[124px] cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:border-violet-200 hover:shadow-md"
                            >
                                {/* Banner strip (only when a stadium banner exists) */}
                                {banner && (
                                    <div
                                        className="relative h-9 shrink-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${banner})`,
                                        }}
                                    >
                                        <div className="absolute left-1.5 top-1.5 flex items-center gap-1.5">
                                            <span className="rounded bg-white/90 px-2.5 py-1.5 text-[12px] font-extrabold leading-none text-gray-950 shadow-sm">
                                                {gameTime}
                                            </span>

                                            {isDay && (
                                                <span className="flex items-center gap-1 rounded bg-amber-100/95 px-2 py-1.5 text-[12px] font-extrabold leading-none text-amber-700 shadow-sm">
                                                    <Sun className="h-3.5 w-3.5" />
                                                    Day
                                                </span>
                                            )}

                                            {isNight && (
                                                <span className="flex items-center gap-1 rounded bg-indigo-100/95 px-2 py-1.5 text-[12px] font-extrabold leading-none text-indigo-700 shadow-sm">
                                                    <Moon className="h-3.5 w-3.5" />
                                                    Night
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Matchup: compact under a banner, expanded to fill the card without one */}
                                <div
                                    className={cn(
                                        "flex min-h-0 flex-1 items-center gap-2.5",
                                        banner ? "p-2" : "p-2.5",
                                    )}
                                >
                                    <div className="flex h-full min-w-0 flex-1 flex-col gap-0.5">
                                        <TeamRow
                                            compact={!!banner}
                                            name={game.team.name}
                                            logo={game.team.logo}
                                            score={game.teamScore}
                                            win={game.teamOutcome === "Win"}
                                            favored={teamFavored}
                                        />
                                        <TeamRow
                                            compact={!!banner}
                                            name={game.opponent.name}
                                            logo={game.opponent.logo}
                                            score={game.opponentScore}
                                            win={game.opponentOutcome === "Win"}
                                            favored={opponentFavored}
                                            away
                                        />
                                    </div>
                                    {(game.stadium?.name ||
                                        game.bannedStadium?.name) && (
                                        <div className="flex w-[130px] shrink-0 flex-col justify-center gap-1">
                                            {game.stadium?.name && (
                                                <div className="flex items-start gap-1 rounded-md border border-green-200 bg-green-100 px-1.5 py-1 text-[11px] font-bold leading-tight text-green-800">
                                                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                                    <span className="break-words leading-tight">
                                                        {game.stadium.name}
                                                    </span>
                                                </div>
                                            )}

                                            {game.bannedStadium?.name && (
                                                <div className="flex items-start gap-1 rounded-md border border-red-200 bg-red-100 px-1.5 py-1 text-[11px] font-bold leading-tight text-red-700">
                                                    <Ban className="mt-0.5 h-3 w-3 shrink-0" />
                                                    <span className="break-words leading-tight decoration-red-500 decoration-2">
                                                        {
                                                            game.bannedStadium
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "flex w-[95px] shrink-0 flex-col items-center justify-center gap-1 rounded-md bg-violet-50/80 py-1",
                                            banner && "self-center",
                                            !banner && "h-full",
                                        )}
                                    >
                                        {!banner && (
                                            <span className="rounded bg-white px-2.5 py-1.5 text-[12px] font-extrabold leading-none text-gray-950 shadow-sm">
                                                {gameTime}
                                            </span>
                                        )}
                                        {oddsBadge}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-xs text-gray-500">
                        No games scheduled. Check another week.
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 border-t border-gray-100 pt-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-500">
                        Y
                    </span>
                    Favored to win
                </span>
                <span>Click matchup for details</span>
            </div>
        </div>
    );
}

function TeamRow({
    name,
    logo,
    score,
    win = false,
    favored = false,
    away = false,
    compact = false,
}: {
    name: string;
    logo?: string | null;
    score?: number | null;
    win?: boolean;
    favored?: boolean;
    away?: boolean;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 items-center justify-between gap-2 rounded-md",
                compact ? "px-2" : "px-3",
                win ? "bg-green-50/80" : "bg-gray-50/60",
            )}
        >
            <div
                className={cn(
                    "flex min-w-0 items-center",
                    compact ? "gap-2" : "gap-3",
                )}
            >
                {logo ? (
                    <img
                        src={logo}
                        alt={`${name} logo`}
                        className={cn(
                            "shrink-0 rounded-full border bg-white object-cover",
                            compact ? "h-7 w-7" : "h-10 w-10 border-2",
                            win ? "border-green-300" : "border-gray-200",
                        )}
                    />
                ) : (
                    <div
                        className={cn(
                            "shrink-0 rounded-full border border-gray-200 bg-gray-100",
                            compact ? "h-7 w-7" : "h-10 w-10",
                        )}
                    />
                )}
                <span
                    className={cn(
                        "truncate text-gray-900",
                        compact ? "text-base" : "text-lg",
                        win ? "font-extrabold" : "font-semibold",
                    )}
                >
                    {name}
                </span>
                <span
                    className={cn(
                        "shrink-0 font-semibold text-gray-500",
                        compact ? "text-xs" : "text-sm",
                    )}
                >
                    ({away ? "A" : "H"})
                </span>
                {favored && (
                    <span
                        title="Favored to win"
                        className={cn(
                            "flex shrink-0 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-600",
                            compact ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs",
                        )}
                    >
                        Y
                    </span>
                )}
            </div>

            <span
                className={cn(
                    "flex items-center justify-center rounded-md font-extrabold",
                    compact
                        ? "h-8 min-w-[34px] px-1.5 text-base"
                        : "h-10 min-w-[46px] px-2 text-xl",
                    win
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700",
                )}
            >
                {score ?? (
                    <span className="font-semibold text-gray-400">—</span>
                )}
            </span>
        </div>
    );
}
