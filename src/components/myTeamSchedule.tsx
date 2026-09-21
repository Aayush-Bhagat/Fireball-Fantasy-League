import { GameResponseDto } from "@/dtos/gameDtos";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

interface Props {
    scheduleData: Promise<GameResponseDto>;
}

export default async function MyTeamSchedule({ scheduleData }: Props) {
    const { games } = await scheduleData;

    const getGameResult = (game: GameResponseDto["games"][number]) => {
        if (
            game.teamScore === null ||
            game.opponentScore === null ||
            game.teamScore === undefined ||
            game.opponentScore === undefined
        ) {
            return null;
        }

        if (game.teamScore > game.opponentScore) {
            return "W";
        }

        if (game.teamScore < game.opponentScore) {
            return "L";
        }

        return "T";
    };

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>

                <p className="mt-1 text-sm text-slate-500">Games and results</p>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
                {games.map((game) => {
                    const result = getGameResult(game);

                    const gameDate = game.playedAt
                        ? new Date(game.playedAt)
                        : null;

                    return (
                        <Link
                            key={game.gameId}
                            href={`/game/${game.gameId}`}
                            className="group block cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-stretch">
                                {/* Date */}
                                <div className="flex shrink-0 items-center border-b border-slate-100 bg-slate-50 px-4 py-3 sm:w-[150px] sm:border-b-0 sm:border-r">
                                    <div className="w-full text-center sm:text-left">
                                        {gameDate ? (
                                            <>
                                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    {format(gameDate, "EEE")}
                                                </div>

                                                <div className="text-lg font-bold text-slate-800">
                                                    {format(gameDate, "MMM d")}
                                                </div>

                                                <div className="text-xs text-slate-500">
                                                    {format(gameDate, "yyyy")}
                                                </div>

                                                <div className="mt-1 text-xs font-medium text-slate-500">
                                                    {format(gameDate, "p")}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm font-semibold text-slate-400">
                                                Date TBD
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Matchup */}
                                <div className="flex min-w-0 flex-1 items-center px-4 py-4 sm:px-6">
                                    <div className="flex w-full items-center justify-center gap-3 sm:gap-6">
                                        {/* Team */}
                                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                                            <div className="min-w-0 text-right">
                                                <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                                    {game.team.name}
                                                </div>

                                                <div className="mt-0.5 text-xs text-slate-400">
                                                    {game.teamWins} -{" "}
                                                    {game.teamLosses}
                                                </div>
                                            </div>

                                            {game.team.logo ? (
                                                <img
                                                    src={game.team.logo}
                                                    alt={`${game.team.name} logo`}
                                                    className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-white object-cover sm:h-12 sm:w-12"
                                                />
                                            ) : (
                                                <div className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-slate-100 sm:h-12 sm:w-12" />
                                            )}
                                        </div>

                                        {/* VS */}
                                        <div className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            VS
                                        </div>

                                        {/* Opponent */}
                                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                            {game.opponent.logo ? (
                                                <img
                                                    src={game.opponent.logo}
                                                    alt={`${game.opponent.name} logo`}
                                                    className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-white object-cover sm:h-12 sm:w-12"
                                                />
                                            ) : (
                                                <div className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-slate-100 sm:h-12 sm:w-12" />
                                            )}

                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                                    {game.opponent.name}
                                                </div>

                                                <div className="mt-0.5 text-xs text-slate-400">
                                                    {game.opponentWins} -{" "}
                                                    {game.opponentLosses}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Score / Result */}
                                <div className="flex shrink-0 items-center justify-center border-t border-slate-100 px-5 py-3 sm:w-[115px] sm:border-l sm:border-t-0">
                                    {result ? (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                    result === "W"
                                                        ? "bg-green-100 text-green-700"
                                                        : result === "L"
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {result}
                                            </span>

                                            <span className="text-sm font-bold text-slate-800">
                                                {game.teamScore} -{" "}
                                                {game.opponentScore}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-400">
                                            Upcoming
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {/* Empty State */}
                {games.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                        <p className="font-semibold text-slate-700">
                            No games scheduled
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            This team doesn&apos;t have any games on the
                            schedule yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
