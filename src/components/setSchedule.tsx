"use client";

import { useState } from "react";
import { TeamResponseDto } from "@/dtos/teamDtos";

type Props = {
    teamsData: TeamResponseDto;
};

type Game = {
    homeTeamId: string | null;
    awayTeamId: string | null;
    datetime: string;
};

type Week = {
    games: Game[];
    open?: boolean;
};

export function SetSeasonSchedule({ teamsData }: Props) {
    const { teams } = teamsData;

    const [weeks, setWeeks] = useState<Week[]>(
        Array.from({ length: 10 }, () => ({
            open: false,
            games: Array.from({ length: 4 }, () => ({
                homeTeamId: null,
                awayTeamId: null,
                datetime: "",
            })),
        })),
    );

    const updateGame = (
        weekIndex: number,
        gameIndex: number,
        field: keyof Game,
        value: string,
    ) => {
        setWeeks((prev) =>
            prev.map((week, wIdx) => {
                if (wIdx !== weekIndex) return week;

                return {
                    ...week,
                    games: week.games.map((g, gIdx) =>
                        gIdx === gameIndex ? { ...g, [field]: value } : g,
                    ),
                };
            }),
        );
    };

    const swapTeams = (weekIndex: number, gameIndex: number) => {
        setWeeks((prev) =>
            prev.map((week, wIdx) => {
                if (wIdx !== weekIndex) return week;

                return {
                    ...week,
                    games: week.games.map((g, gIdx) => {
                        if (gIdx !== gameIndex) return g;
                        return {
                            ...g,
                            homeTeamId: g.awayTeamId,
                            awayTeamId: g.homeTeamId,
                        };
                    }),
                };
            }),
        );
    };

    const clearGame = (weekIndex: number, gameIndex: number) => {
        setWeeks((prev) =>
            prev.map((week, wIdx) => {
                if (wIdx !== weekIndex) return week;

                return {
                    ...week,
                    games: week.games.map((g, gIdx) =>
                        gIdx === gameIndex
                            ? {
                                  homeTeamId: null,
                                  awayTeamId: null,
                                  datetime: "",
                              }
                            : g,
                    ),
                };
            }),
        );
    };

    const isTeamUsedInWeek = (
        teamId: string,
        week: Week,
        gameIndex: number,
    ) => {
        return week.games.some((g, i) => {
            if (i === gameIndex) return false;
            return g.homeTeamId === teamId || g.awayTeamId === teamId;
        });
    };

    const handleSave = () => {
        console.log("Season Schedule:", weeks);
    };

    const toggleWeek = (index: number) => {
        setWeeks((prev) =>
            prev.map((w, i) => (i === index ? { ...w, open: !w.open } : w)),
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">
                        Season Schedule Builder
                    </h1>
                </div>

                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium"
                >
                    Save Schedule
                </button>
            </div>

            {/* WEEKS */}
            <div className="space-y-4">
                {weeks.map((week, weekIndex) => (
                    <div
                        key={weekIndex}
                        className="border rounded-2xl bg-white shadow-sm overflow-hidden"
                    >
                        {/* Week header */}
                        <div
                            onClick={() => toggleWeek(weekIndex)}
                            className="flex justify-between items-center px-5 py-4 bg-gray-50 cursor-pointer"
                        >
                            <div className="font-semibold">
                                Week {weekIndex + 1}
                            </div>

                            <div className="text-sm text-gray-500">
                                {
                                    week.games.filter(
                                        (g) => g.homeTeamId && g.awayTeamId,
                                    ).length
                                }
                                /4 complete
                            </div>
                        </div>

                        {/* Games */}
                        {week.open && (
                            <div className="p-5 space-y-4">
                                {week.games.map((game, gameIndex) => {
                                    const incomplete =
                                        !game.homeTeamId ||
                                        !game.awayTeamId ||
                                        !game.datetime;

                                    return (
                                        <div
                                            key={gameIndex}
                                            className={`rounded-xl border p-4 space-y-3 ${
                                                incomplete
                                                    ? "border-orange-200 bg-orange-50"
                                                    : "border-gray-100 bg-white"
                                            }`}
                                        >
                                            {/* top row */}
                                            <div className="flex justify-between items-center">
                                                <div className="font-medium text-sm text-gray-600">
                                                    Game {gameIndex + 1}
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            swapTeams(
                                                                weekIndex,
                                                                gameIndex,
                                                            )
                                                        }
                                                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                                    >
                                                        Swap
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            clearGame(
                                                                weekIndex,
                                                                gameIndex,
                                                            )
                                                        }
                                                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>

                                            {/* match row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                                                {/* HOME */}
                                                <select
                                                    value={
                                                        game.homeTeamId ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        updateGame(
                                                            weekIndex,
                                                            gameIndex,
                                                            "homeTeamId",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Select Home
                                                    </option>
                                                    {teams.map((team) => (
                                                        <option
                                                            key={team.id}
                                                            value={team.id}
                                                            disabled={isTeamUsedInWeek(
                                                                team.id,
                                                                week,
                                                                gameIndex,
                                                            )}
                                                        >
                                                            {team.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="text-center text-xs font-semibold text-gray-400">
                                                    VS
                                                </div>

                                                {/* AWAY */}
                                                <select
                                                    value={
                                                        game.awayTeamId ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        updateGame(
                                                            weekIndex,
                                                            gameIndex,
                                                            "awayTeamId",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                                >
                                                    <option value="">
                                                        Select Away
                                                    </option>
                                                    {teams.map((team) => (
                                                        <option
                                                            key={team.id}
                                                            value={team.id}
                                                            disabled={isTeamUsedInWeek(
                                                                team.id,
                                                                week,
                                                                gameIndex,
                                                            )}
                                                        >
                                                            {team.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* datetime */}
                                            <input
                                                type="datetime-local"
                                                value={game.datetime}
                                                onChange={(e) =>
                                                    updateGame(
                                                        weekIndex,
                                                        gameIndex,
                                                        "datetime",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
