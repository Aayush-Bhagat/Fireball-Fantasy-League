import React from "react";
import { Loader2 } from "lucide-react";

interface CareerTotals {
    name: string;
    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;
    outsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;
    careerAVG: number;
    careerHR: number;
    careerRBI: number;
    careerERA: number;
    ip: number;
    image?: string | null;
}

export default function CareerStatsComparison({
    playerA,
    playerB,
}: {
    playerA: CareerTotals;
    playerB: CareerTotals;
}) {
    if (!playerA || !playerB) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const rows: {
        label: string;
        valA: number | string;
        valB: number | string;
        inverse?: boolean;
    }[] = [
        { label: "At Bats", valA: playerA.atBats, valB: playerB.atBats },
        { label: "Hits", valA: playerA.hits, valB: playerB.hits },
        { label: "Home Runs", valA: playerA.homeRuns, valB: playerB.homeRuns },
        { label: "RBIs", valA: playerA.rbis, valB: playerB.rbis },
        {
            label: "AVG",
            valA: playerA.careerAVG.toFixed(3),
            valB: playerB.careerAVG.toFixed(3),
        },
        { label: "Innings Pitched", valA: playerA.ip, valB: playerB.ip },
        {
            label: "Runs Allowed",
            valA: playerA.runsAllowed,
            valB: playerB.runsAllowed,
            inverse: true,
        },
        { label: "Walks", valA: playerA.walks, valB: playerB.walks },
        {
            label: "Strikeouts",
            valA: playerA.strikeouts,
            valB: playerB.strikeouts,
        },
        {
            label: "ERA",
            valA: playerA.careerERA.toFixed(2),
            valB: playerB.careerERA.toFixed(2),
            inverse: true,
        },
    ];

    return (
        <div className="border rounded-xl shadow-lg bg-white overflow-x-auto h-full">
            <table className="w-full min-w-[500px] text-sm h-full">
                <thead className="bg-purple-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-left text-gray-700"></th>
                        <th className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-2">
                                {playerA.image && (
                                    <img
                                        src={playerA.image}
                                        alt={playerA.name}
                                        className="w-14 h-14 rounded-full border object-cover shadow-sm"
                                    />
                                )}
                                <span className="font-semibold text-purple-700">
                                    {playerA.name}
                                </span>
                            </div>
                        </th>
                        <th className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-2">
                                {playerB.image && (
                                    <img
                                        src={playerB.image}
                                        alt={playerB.name}
                                        className="w-14 h-14 rounded-full border object-cover shadow-sm"
                                    />
                                )}
                                <span className="font-semibold text-purple-700">
                                    {playerB.name}
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ label, valA, valB, inverse }) => {
                        const aNumber = Number(valA);
                        const bNumber = Number(valB);

                        let betterA: boolean | null = null;
                        if (aNumber > bNumber) betterA = inverse ? false : true;
                        else if (aNumber < bNumber)
                            betterA = inverse ? true : false;

                        return (
                            <tr
                                key={label}
                                className="border-t hover:bg-purple-50 transition-colors"
                            >
                                <td className="px-4 py-2 font-medium text-gray-500">
                                    {label}
                                </td>
                                <td
                                    className={`px-4 py-2 text-center font-semibold ${
                                        betterA === true
                                            ? "text-green-600 font-bold"
                                            : ""
                                    }`}
                                >
                                    {valA}
                                </td>
                                <td
                                    className={`px-4 py-2 text-center font-semibold ${
                                        betterA === false
                                            ? "text-green-600 font-bold"
                                            : ""
                                    }`}
                                >
                                    {valB}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
