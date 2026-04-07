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

// ---------------- DRAFT DATA ----------------
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
function getPicksForTeam(round: Round, teamId: string) {
    return round.picks.filter((p) => p.teamId === teamId);
}

function isCompPick(pickInRound: number) {
    return pickInRound > 8;
}

function formatPickLabel(pick: Pick) {
    return `${pick.round}.${pick.pickInRound}`;
}

// ---------------- MAIN COMPONENT ----------------
export default async function DraftBoard() {
    const { players } = await viewFreeAgents();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col lg:flex-row">
            {/* LEFT SIDE */}
            <div className="flex-1 p-4 lg:p-8 overflow-hidden">
                {/* TITLE */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">
                        Fireball Season 3 Draft
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Live draft board
                    </p>
                </div>

                {/* SCROLL AREA */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
                    <div className="min-w-[950px] p-4">
                        {/* TEAM HEADER */}
                        <div className="grid grid-cols-8 gap-3 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 pb-3">
                            {teams.map((team) => (
                                <div key={team.id} className="text-center">
                                    <div className="w-11 h-11 mx-auto mb-1 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md" />
                                    <div className="text-xs font-semibold text-gray-700 truncate">
                                        {team.name}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ROUNDS */}
                        <div className="space-y-5 mt-4">
                            {rounds.map((round) => (
                                <div
                                    key={round.roundNumber}
                                    className="rounded-xl border border-gray-100 bg-gray-50 p-3 shadow-sm"
                                >
                                    {/* GRID */}
                                    <div className="grid grid-cols-8 gap-3">
                                        {teams.map((team) => {
                                            const picks = getPicksForTeam(
                                                round,
                                                team.id,
                                            );

                                            return (
                                                <div
                                                    key={team.id}
                                                    className="rounded-xl bg-white border border-gray-200 p-2 min-h-[110px] shadow-sm hover:shadow-md transition"
                                                >
                                                    {picks.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {picks.map(
                                                                (pick, idx) => {
                                                                    const comp =
                                                                        isCompPick(
                                                                            pick.pickInRound,
                                                                        );

                                                                    const isActive =
                                                                        !pick.player;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className={`rounded-lg p-2 text-xs border transition-all
                                                                            ${
                                                                                isActive
                                                                                    ? "bg-blue-50 border-blue-400 ring-1 ring-blue-200"
                                                                                    : "bg-gray-50 border-gray-200"
                                                                            }
                                                                            ${
                                                                                comp
                                                                                    ? "border-yellow-400 bg-yellow-50"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="font-bold text-gray-700">
                                                                                    {formatPickLabel(
                                                                                        pick,
                                                                                    )}
                                                                                </span>

                                                                                {isActive && (
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                                                                        OTC
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="text-gray-500 truncate mt-1">
                                                                                {pick.player ||
                                                                                    "On the clock"}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                                                            No picks
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-[520px] border-t lg:border-t-0 lg:border-l bg-white shadow-xl">
                <div className="sticky top-0 p-4 border-b bg-white/80 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-gray-800">
                        Player Board
                    </h2>
                    <p className="text-xs text-gray-500">
                        Free agents & available players
                    </p>
                </div>

                <div className="p-3">
                    <PlayerPanel players={players} freeAgents={true} />
                </div>
            </div>
        </div>
    );
}
