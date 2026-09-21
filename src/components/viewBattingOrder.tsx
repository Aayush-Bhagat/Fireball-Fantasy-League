import { TeamLineupDto, TeamRosterDto } from "@/dtos/teamDtos";
import React from "react";

interface Props {
    battingLineup: Promise<TeamLineupDto>;
    lineupData: Promise<TeamLineupDto>;
    rosterData: Promise<TeamRosterDto>;
}

export default async function ViewBattingOrder({
    battingLineup,
    lineupData,
    rosterData,
}: Props) {
    const { battingOrder } = await battingLineup;
    const { fieldingLineup } = await lineupData;
    const { roster } = await rosterData;

    // Map player ID -> position
    const playerIdToPositionMap: Record<string, string> = {};

    Object.entries(fieldingLineup).forEach(([position, player]) => {
        if (player) {
            playerIdToPositionMap[player.id] = position;
        }
    });

    // Map player ID -> roster player
    const rosterMap = new Map(roster.map((player) => [player.id, player]));

    return (
        <div className="min-h-screen  px-4 py-6">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Batting Order
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Starting lineup
                    </p>
                </div>

                {/* Lineup */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* Table Header */}
                    <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[55px_1fr_220px]">
                        <div>#</div>
                        <div>Player</div>

                        <div className="grid grid-cols-3 text-center">
                            <span>AVG</span>
                            <span>HR</span>
                            <span>RBI</span>
                        </div>
                    </div>

                    {/* Players */}
                    {battingOrder.map((player, index) => {
                        const position = player?.id
                            ? playerIdToPositionMap[player.id]
                            : undefined;

                        const rosterPlayer = player?.id
                            ? rosterMap.get(player.id)
                            : undefined;

                        const stats = rosterPlayer?.stats;

                        const image = player?.image || "/default-image.jpg";

                        return (
                            <div
                                key={`${player?.id}-${index}`}
                                className={`grid items-center px-4 py-2.5 sm:grid-cols-[55px_1fr_220px] sm:px-5 ${
                                    index !== battingOrder.length - 1
                                        ? "border-b border-slate-100"
                                        : ""
                                } ${
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-slate-50/60"
                                } hover:bg-blue-50/40`}
                            >
                                {/* Batting Number */}
                                <div className="flex items-center">
                                    <span className="text-lg font-bold text-slate-400">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Player */}
                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={image}
                                        alt={player?.name || "Player"}
                                        className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover"
                                    />

                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-slate-900">
                                            {player?.name || "Unknown Player"}
                                        </div>

                                        {position && (
                                            <div className="mt-0.5 text-xs text-slate-400">
                                                {positionName(position)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-2 grid grid-cols-3 sm:mt-0">
                                    <Stat
                                        label="AVG"
                                        value={
                                            stats?.battingAverage !== undefined
                                                ? stats.battingAverage.toFixed(
                                                      3,
                                                  )
                                                : "—"
                                        }
                                    />

                                    <Stat
                                        label="HR"
                                        value={stats?.homeRuns ?? "—"}
                                    />

                                    <Stat
                                        label="RBI"
                                        value={stats?.rbis ?? "—"}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {battingOrder.length === 0 && (
                        <div className="px-6 py-10 text-center">
                            <p className="font-semibold text-slate-700">
                                No batting order available
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                This team hasn&apos;t set a batting order yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------
   Stat
--------------------------------------------- */

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">
                {label}
            </div>

            <div className="text-sm font-semibold text-slate-700">{value}</div>
        </div>
    );
}

/* ---------------------------------------------
   Position
--------------------------------------------- */

function positionName(position: string) {
    const positions: Record<string, string> = {
        P: "Pitcher",
        C: "Catcher",
        "1B": "First Base",
        "2B": "Second Base",
        "3B": "Third Base",
        SS: "Shortstop",
        LF: "Left Field",
        CF: "Center Field",
        RF: "Right Field",
    };

    return positions[position] ?? position;
}
