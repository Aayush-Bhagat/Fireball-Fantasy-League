import { viewFreeAgents } from "@/requests/players";
import React from "react";
import PlayerPanel from "./playerPanel";

// ---------------- TYPES ----------------
type Team = { id: string; name: string };

type Pick = {
    round: number;
    pickInRound: number;
    teamId: string;
    player?: string;
};

type Round = {
    roundNumber: number;
    picks: Pick[];
};

// ---------------- TEAMS ----------------
const teams: Team[] = [
    { id: "1", name: "Team 1" },
    { id: "2", name: "Team 2" },
    { id: "3", name: "Team 3" },
    { id: "4", name: "Team 4" },
    { id: "5", name: "Team 5" },
    { id: "6", name: "Team 6" },
    { id: "7", name: "Team 7" },
    { id: "8", name: "Team 8" },
];

// ---------------- DATA ----------------
const rounds: Round[] = [
    {
        roundNumber: 1,
        picks: teams.map((t, i) => ({
            round: 1,
            pickInRound: i + 1,
            teamId: t.id,
        })),
    },
    {
        roundNumber: 2,
        picks: [
            ...teams.map((t, i) => ({
                round: 2,
                pickInRound: i + 1,
                teamId: t.id,
            })),
            { round: 2, pickInRound: 9, teamId: "3" },
            { round: 2, pickInRound: 10, teamId: "6" },
        ],
    },
    {
        roundNumber: 3,
        picks: [
            ...teams.map((t, i) => ({
                round: 3,
                pickInRound: i + 1,
                teamId: t.id,
            })),
            { round: 3, pickInRound: 9, teamId: "1" },
            { round: 3, pickInRound: 10, teamId: "5" },
        ],
    },
    {
        roundNumber: 4,
        picks: teams.map((t, i) => ({
            round: 4,
            pickInRound: i + 1,
            teamId: t.id,
        })),
    },
    {
        roundNumber: 5,
        picks: teams.map((t, i) => ({
            round: 5,
            pickInRound: i + 1,
            teamId: t.id,
        })),
    },
    {
        roundNumber: 6,
        picks: teams.map((t, i) => ({
            round: 6,
            pickInRound: i + 1,
            teamId: t.id,
        })),
    },
];

// ---------------- HELPERS ----------------
const formatPick = (p: Pick) => `${p.round}.${p.pickInRound}`;

// ---------------- COMPONENTS ----------------

function PickCard({ pick }: { pick: Pick }) {
    const isActive = !pick.player;

    return (
        <div
            className={`rounded-lg p-2 text-xs border min-h-[70px]
            ${isActive ? "bg-blue-50 border-blue-400" : "bg-gray-50"}`}
        >
            <div className="flex justify-between">
                <span className="font-bold text-gray-700">
                    {formatPick(pick)}
                </span>

                {/* {isActive && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 rounded-full">
                        OTC
                    </span>
                )} */}
            </div>

            <div className="text-gray-500 truncate mt-1">
                {pick.player || "On the clock"}
            </div>
        </div>
    );
}

function CompPickCard({ pick }: { pick: Pick }) {
    return (
        <div className="rounded-md p-1 text-xs bg-yellow-100 border border-yellow-400 min-h-[70px]">
            <div className="flex justify-between">
                <span className="font-bold">{formatPick(pick)}</span>
            </div>
            <div className="text-gray-600 truncate">
                {pick.player || "Comp Pick"}
            </div>
        </div>
    );
}

function TeamColumn({
    picks,
    isComp = false,
}: {
    picks: Pick[];
    isComp?: boolean;
}) {
    if (picks.length === 0) {
        return (
            <div
                className={
                    isComp
                        ? "min-h-[70px]"
                        : "min-h-[110px] flex items-center justify-center text-gray-300 text-xs"
                }
            ></div>
        );
    }

    return (
        <div className="space-y-2">
            {picks.map((p, i) =>
                isComp ? (
                    <CompPickCard key={i} pick={p} />
                ) : (
                    <PickCard key={i} pick={p} />
                ),
            )}
        </div>
    );
}

// ---------------- MAIN ----------------
export default async function DraftBoard() {
    const { players } = await viewFreeAgents();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col lg:flex-row">
            {/* LEFT */}
            <div className="flex-1 p-4 lg:p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800">
                        Fireball League Draft
                    </h1>
                    <p className="text-sm text-gray-500">Season 4</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border bg-white shadow-lg">
                    <div className="min-w-[950px] p-4">
                        {/* HEADER */}
                        <div className="grid grid-cols-8 gap-3 sticky top-0 bg-white/80 backdrop-blur border-b pb-3">
                            {teams.map((t) => (
                                <div key={t.id} className="text-center">
                                    <div className="w-11 h-11 mx-auto mb-1 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600" />
                                    <div className="text-xs font-semibold text-gray-700">
                                        {t.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ROUNDS */}
                        <div className="space-y-5 mt-4">
                            {rounds.map((round) => {
                                const normal = round.picks.filter(
                                    (p) => p.pickInRound <= 8,
                                );
                                const comp = round.picks.filter(
                                    (p) => p.pickInRound > 8,
                                );

                                return (
                                    <div
                                        key={round.roundNumber}
                                        className="rounded-xl border bg-gray-50 p-3"
                                    >
                                        <div className="mb-2 font-semibold text-gray-700">
                                            Round {round.roundNumber}
                                        </div>

                                        {/* NORMAL */}
                                        <div className="grid grid-cols-8 gap-3">
                                            {teams.map((t) => (
                                                <TeamColumn
                                                    key={t.id}
                                                    picks={normal.filter(
                                                        (p) =>
                                                            p.teamId === t.id,
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        {/* COMP */}
                                        {comp.length > 0 && (
                                            <>
                                                <div className="text-[11px] text-yellow-700 font-semibold mt-3 mb-1">
                                                    Compensatory Picks
                                                </div>

                                                <div className="grid grid-cols-8 gap-3">
                                                    {teams.map((t) => (
                                                        <TeamColumn
                                                            key={t.id}
                                                            picks={comp.filter(
                                                                (p) =>
                                                                    p.teamId ===
                                                                    t.id,
                                                            )}
                                                            isComp
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-[520px] border-t lg:border-l bg-white shadow-xl">
                <div className="sticky top-0 p-4 border-b bg-white/80 backdrop-blur">
                    <h2 className="text-lg font-bold">Player Board</h2>
                    <p className="text-xs text-gray-500">
                        Free agents & available players
                    </p>
                </div>

                <div className="p-3">
                    <PlayerPanel players={players} freeAgents />
                </div>
            </div>
        </div>
    );
}
