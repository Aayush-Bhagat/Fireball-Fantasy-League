import { GameStatsDto } from "@/dtos/gameDtos";
import { BasicPlayerStatsDto } from "@/dtos/playerDtos";
import React from "react";

interface Props {
    boxScore: Promise<GameStatsDto>;
}

export const BoxScore = async ({ boxScore }: Props) => {
    const data = await boxScore;

    const renderTable = (
        teamName: string,
        icon: string | null,
        stats: BasicPlayerStatsDto[]
    ) => {
        const totals = stats.reduce(
            (acc, p) => {
                acc.ab += p.atBats;
                acc.h += p.hits;
                acc.r += p.runs;
                acc.hr += p.homeRuns;
                acc.rbi += p.rbis;
                acc.po += p.outs;
                return acc;
            },
            { ab: 0, h: 0, r: 0, hr: 0, rbi: 0, po: 0 }
        );

        return (
            <div className="bg-white rounded-xl shadow-lg w-full border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-violet-100 ">
                    <h2 className="text-xl font-bold text-gray-800">
                        {teamName}
                    </h2>
                    {icon && (
                        <img
                            src={icon}
                            alt={`${teamName} logo`}
                            className="w-10 h-10"
                        />
                    )}
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            {["Player", "AB", "H", "R", "HR", "RBI", "PO"].map(
                                (header) => (
                                    <th key={header} className="px-5 py-3">
                                        {header}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((p, idx) => (
                            <tr
                                key={idx}
                                className="border-t hover:bg-gray-50 transition duration-150"
                            >
                                <td className="px-5 py-3 font-medium text-gray-800">
                                    {p.playerName}
                                </td>
                                <td className="px-5 py-4">{p.atBats}</td>
                                <td className="px-5 py-4">{p.hits}</td>
                                <td className="px-5 py-4">{p.runs}</td>
                                <td className="px-5 py-4">{p.homeRuns}</td>
                                <td className="px-5 py-4">{p.rbis}</td>
                                <td className="px-5 py-4">{p.outs}</td>
                            </tr>
                        ))}
                        <tr className="font-semibold bg-gray-100 border-t">
                            <td className="px-5 py-4">TOTALS</td>
                            <td className="px-5 py-4">{totals.ab}</td>
                            <td className="px-5 py-4">{totals.h}</td>
                            <td className="px-5 py-4">{totals.r}</td>
                            <td className="px-5 py-4">{totals.hr}</td>
                            <td className="px-5 py-4">{totals.rbi}</td>
                            <td className="px-5 py-4">{totals.po}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
                    {data.team.name} vs {data.opponent.name}
                </h1>
                <h2 className="text-6xl font-extrabold md:text-4xl text-center text-gray-700 mb-8">
                    <span className="font-semibold text-black">
                        {data.teamScore}{" "}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-black">
                        {data.opponentScore}
                    </span>
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                    {renderTable(
                        data.team.name,
                        data.team.logo,
                        data.teamPlayers
                    )}
                    {renderTable(
                        data.opponent.name,
                        data.opponent.logo,
                        data.opponentPlayers
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoxScore;
