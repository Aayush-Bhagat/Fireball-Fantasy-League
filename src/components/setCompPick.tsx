"use client";

import { useState } from "react";
import { TeamResponseDto } from "@/dtos/teamDtos";

type Props = {
    teamsData: TeamResponseDto;
};

type CompPick = {
    teamId: string;
    round: number | null;
    compIndex: number | null;
};

export function SetCompensatoryPicks({ teamsData }: Props) {
    const { teams } = teamsData;
    const totalTeams = teams.length;

    const [picks, setPicks] = useState<CompPick[]>(
        teams.map((team) => ({
            teamId: team.id,
            round: null,
            compIndex: null,
        })),
    );

    const handleChange = (
        teamId: string,
        field: "round" | "compIndex",
        value: number | null,
    ) => {
        setPicks((prev) =>
            prev.map((p) => {
                if (p.teamId !== teamId) return p;

                if (field === "round" && value === null) {
                    return { ...p, round: null, compIndex: null };
                }

                return { ...p, [field]: value };
            }),
        );
    };

    const calculateOverall = (
        round: number | null,
        compIndex: number | null,
    ) => {
        if (!round || !compIndex) return "-";

        const compBefore = picks.filter(
            (p) => p.round !== null && p.round < round,
        ).length;

        const compInRoundBefore = picks.filter(
            (p) =>
                p.round === round &&
                p.compIndex !== null &&
                p.compIndex < compIndex,
        ).length;

        return (
            (round - 1) * totalTeams +
            totalTeams +
            compBefore +
            compInRoundBefore +
            1
        );
    };

    const handleSave = () => {
        const formatted = picks.map((p) => ({
            ...p,
            overall: calculateOverall(p.round, p.compIndex),
        }));

        console.log("Comp Picks:", formatted);
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Compensatory Picks</h1>
                <p className="text-sm text-gray-500">
                    Assign compensatory rounds and pick order for each team.
                </p>
            </div>

            {/* Column Labels */}
            <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 px-3 mb-2">
                <div className="col-span-4">Team</div>
                <div className="col-span-3">Round</div>
                <div className="col-span-3">Comp Pick</div>
                <div className="col-span-2 text-center">Overall</div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
                {teams.map((team) => {
                    const pickData = picks.find((p) => p.teamId === team.id)!;
                    const isDisabled = pickData.round === null;

                    return (
                        <div
                            key={team.id}
                            className="grid grid-cols-12 items-center gap-3 bg-white border rounded-xl px-3 py-3 shadow-sm hover:shadow transition"
                        >
                            {/* Team */}
                            <div className="col-span-4 font-medium text-gray-900">
                                {team.name}
                            </div>

                            {/* Round */}
                            <div className="col-span-3">
                                <select
                                    value={pickData.round ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            team.id,
                                            "round",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                        )
                                    }
                                    className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">None</option>
                                    {[2, 3, 4].map((r) => (
                                        <option key={r} value={r}>
                                            Round {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Comp Index */}
                            <div className="col-span-3">
                                <select
                                    value={pickData.compIndex ?? ""}
                                    disabled={isDisabled}
                                    onChange={(e) =>
                                        handleChange(
                                            team.id,
                                            "compIndex",
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                        )
                                    }
                                    className={`w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                                        isDisabled
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <option value="">Pick #</option>
                                    {Array.from(
                                        { length: 10 },
                                        (_, i) => i + 1,
                                    ).map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Overall */}
                            <div className="col-span-2 text-center font-semibold text-gray-800">
                                {calculateOverall(
                                    pickData.round,
                                    pickData.compIndex,
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="mt-6">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                    Save Compensatory Picks
                </button>
            </div>
        </div>
    );
}
