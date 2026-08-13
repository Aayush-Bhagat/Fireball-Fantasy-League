"use client";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWeeklySchedule } from "@/requests/schedule";
import { format } from "date-fns";
import { GameResponseDto } from "@/dtos/gameDtos";
import { useQuery } from "@tanstack/react-query";
import ScheduleTableSkeleton from "@/components/loaders/ScheduleTableSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OddsBadge from "@/components/OddsBadge";
import { cn } from "@/lib/utils";
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

    const weekDate =
        schedule?.find((game) => game.playedAt)?.playedAt ?? null;
    const weekStart = weekDate ? new Date(weekDate).getTime() : null;
    const weekNumber = schedule?.at(0)?.week;

    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold">
                Schedule
                <Link href="/schedule">
                    <Button className="float-right bg-violet-700 hover:bg-violet-800">
                        Full Schedule
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Week {selectedWeek}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Week</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            value={selectedWeek}
                            onValueChange={(value) => setSelectedWeek(value)}
                            defaultValue={"current"}
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
                {selectedWeek === "current" && weekNumber != null && (
                    <span className="text-sm text-gray-700 font-semibold">
                        Week {weekNumber}
                    </span>
                )}
                {weekStart != null && (
                    <span className="text-md text-gray-800">
                        {format(weekStart, "EEEE, MMMM do")}
                    </span>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-center text-sm text-gray-600">
                            <th className="p-2">Time</th>
                            <th className="p-2">Matchup</th>
                            <th className="p-2">Odds</th>
                            <th className="p-2">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule &&
                            schedule.map((game, index) => (
                                <tr
                                    key={index}
                                    className="border-t text-sm text-center cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() =>
                                        router.push(`/game/${game.gameId}`)
                                    }
                                >
                                    <td className="p-2 pb-4">
                                        {weekStart != null
                                            ? format(
                                                  weekStart +
                                                      index * 30 * 60 * 1000,
                                                  "p",
                                              )
                                            : "TBD"}
                                    </td>

                                    <td className="p-2 pb-4">
                                        <div className="flex gap-4">
                                            {/* Team */}
                                            <div className="flex justify-start gap-1 min-w-0 max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[280px]">
                                                <div
                                                    className={cn(
                                                        "flex gap-2 min-w-0 text-left rounded px-1 py-0.5",
                                                        game.teamOutcome ===
                                                            "Win" &&
                                                            "bg-green-100",
                                                    )}
                                                >
                                                    {game.team.logo && (
                                                        <img
                                                            src={game.team.logo}
                                                            alt="Team Logo"
                                                            className="w-6 h-6 rounded-full border shrink-0"
                                                        />
                                                    )}
                                                    <span className="truncate font-medium">
                                                        {game.team.name}
                                                    </span>
                                                </div>
                                                {game.odds &&
                                                    game.odds.teamProb >
                                                        game.odds.opponentProb && (
                                                        <sup
                                                            className="font-bold text-xs text-orange-500 align-super shrink-0"
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                            title="Favored to win"
                                                        >
                                                            Y
                                                        </sup>
                                                    )}
                                            </div>

                                            {/* vs */}
                                            <span className="text-gray-500 font-semibold">
                                                @
                                            </span>

                                            {/* Opponent */}
                                            <div className="flex items-center justify-end gap-1 min-w-0 max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[280px]">
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-2 min-w-0 text-right rounded px-1 py-0.5",
                                                        game.opponentOutcome ===
                                                            "Win" &&
                                                            "bg-green-100",
                                                    )}
                                                >
                                                    <span className="truncate font-medium">
                                                        {game.opponent.name}
                                                    </span>
                                                    {game.opponent.logo && (
                                                        <img
                                                            src={game.opponent.logo}
                                                            alt="Opponent Logo"
                                                            className="w-6 h-6 rounded-full border shrink-0"
                                                        />
                                                    )}
                                                </div>
                                                {game.odds &&
                                                    game.odds.opponentProb >
                                                        game.odds.teamProb && (
                                                        <sup
                                                            className="font-bold text-xs text-orange-500 align-super shrink-0"
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                            title="Favored to win"
                                                        >
                                                            Y
                                                        </sup>
                                                    )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-2">
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
                                                className="justify-center"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-2">
                                        {(game.teamScore != null &&
                                            game.opponentScore != null &&
                                            `${game.teamScore} - ${game.opponentScore}`) ||
                                            "-"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-sm text-gray-700 flex space-x-6">
                <div className="flex items-center space-x-1">
                    <span className="font-bold text-orange-500">Y</span>
                    <span>– Favored to win</span>
                </div>
            </div>
        </div>
    );
}
