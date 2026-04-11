"use client";

import { useState } from "react";
import { TeamResponseDto } from "@/dtos/teamDtos";

type Props = {
    teamsData: TeamResponseDto;
};

export function SetDraftOrder({ teamsData }: Props) {
    const { teams } = teamsData;

    const [order, setOrder] = useState<Record<string, number | null>>(
        Object.fromEntries(teams.map((t) => [t.id, null])),
    );

    const handleChange = (teamId: string, value: number) => {
        const newOrder = { ...order };

        // remove duplicate pick if it exists
        for (const id in newOrder) {
            if (newOrder[id] === value) {
                newOrder[id] = null;
            }
        }

        newOrder[teamId] = value;
        setOrder(newOrder);
    };

    const getAvailableOptions = (teamId: string) => {
        const taken = new Set(
            Object.entries(order)
                .filter(([id]) => id !== teamId)
                .map(([, val]) => val),
        );

        return Array.from({ length: teams.length }, (_, i) => i + 1).filter(
            (num) => !taken.has(num),
        );
    };

    const handleSave = () => {
        console.log("Draft Order:", order);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Draft Order Setup</h1>
                <p className="text-sm text-gray-500">
                    Assign each team a unique draft position from 1 to{" "}
                    {teams.length}.
                </p>
            </div>

            {/* Labels */}
            <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 px-3 mb-2">
                <div className="col-span-6">Team</div>
                <div className="col-span-3 text-center">Pick</div>
                <div className="col-span-3 text-center">Status</div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
                {teams.map((team) => {
                    const value = order[team.id];

                    return (
                        <div
                            key={team.id}
                            className="grid grid-cols-12 items-center gap-3 bg-white border rounded-xl px-3 py-3 shadow-sm hover:shadow transition"
                        >
                            {/* Team */}
                            <div className="col-span-6 font-medium text-gray-900">
                                {team.name}
                            </div>

                            {/* Pick */}
                            <div className="col-span-3 flex justify-center">
                                <select
                                    value={value ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            team.id,
                                            Number(e.target.value),
                                        )
                                    }
                                    className="border rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">—</option>
                                    {getAvailableOptions(team.id).map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status / Rank Badge */}
                            <div className="col-span-3 flex justify-center">
                                {value ? (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                            #{value}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Unassigned
                                    </span>
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
                    Save Draft Order
                </button>
            </div>
        </div>
    );
}
