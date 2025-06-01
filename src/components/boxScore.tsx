import { GameStatsDto } from "@/dtos/gameDtos";
import { BasicPlayerStatsDto } from "@/dtos/playerDtos";
import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
interface Props {
    boxScore: Promise<GameStatsDto>;
}

export const BoxScore = async ({ boxScore }: Props) => {
    const data = await boxScore;

    const inningsToOuts = (ip: number) => {
        const full = Math.floor(ip);
        const decimal = Math.round((ip - full) * 10); // 1.2 means 2 outs
        return full * 3 + decimal;
    };

    // Helper: Convert total outs back to innings pitched
    const outsToInnings = (outs: number) => {
        const innings = Math.floor(outs / 3);
        const remainder = outs % 3;
        return parseFloat(`${innings}.${remainder}`);
    };
    const renderBattingTable = (
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
                <div className="flex items-center justify-between px-6 py-4 bg-violet-200 ">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {teamName} - Batting
                    </h2>
                    {icon && (
                        <img
                            src={icon}
                            alt={`${teamName} logo`}
                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <TooltipProvider>
                                    <th className="px-4 py-3 text-sm font-medium text-gray-700">
                                        Player
                                    </th>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                AB
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>At Bats</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                H
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Hits</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                R
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Runs</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                HR
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Home Runs</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                RBI
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Runs Batted In</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                PO
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Putouts</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((p, idx) => (
                                <tr
                                    key={idx}
                                    className="border-t hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {p.playerName}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.atBats}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.hits}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.runs}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.homeRuns}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.rbis}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.outs}
                                    </td>
                                </tr>
                            ))}
                            <tr className="font-semibold bg-gray-200 border-t">
                                <td className="px-4 py-3">TOTALS</td>
                                <td className="px-4 py-3 text-center">
                                    {totals.ab}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {totals.h}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {totals.r}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {totals.hr}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {totals.rbi}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {totals.po}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPitchingTable = (
        teamName: string,
        icon: string | null,
        stats: BasicPlayerStatsDto[]
    ) => {
        let totalOuts = 0;

        const pitchingTotals = stats.reduce(
            (acc, p) => {
                const outs = inningsToOuts(p.inningsPitched);
                totalOuts += outs;
                acc.s += p.strikeouts;
                acc.w += p.walks;
                acc.er += p.runsAllowed;
                return acc;
            },
            { ip: 0, s: 0, w: 0, er: 0, era: 0 }
        );
        const totalInningsPitched = outsToInnings(totalOuts);
        // Only if totalInningsPitched > 0
        const teamEra =
            totalInningsPitched > 0
                ? ((pitchingTotals.er * 9) / totalInningsPitched).toFixed(2)
                : "-";

        const hasPitchingStats = stats.filter(
            (player) => player.inningsPitched > 0 || player.runsAllowed > 0
        );

        return (
            <div className="bg-white rounded-xl shadow-lg w-full border border-gray-200 overflow-hidden mt-6">
                <div className="flex items-center justify-between px-6 py-4 bg-violet-200 ">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {teamName} - Pitching
                    </h2>
                    {icon && (
                        <img
                            src={icon}
                            alt={`${teamName} logo`}
                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                    )}
                </div>
                {hasPitchingStats && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                                <tr>
                                    <TooltipProvider>
                                        <th className="px-4 py-3 text-sm font-medium text-gray-700">
                                            Player
                                        </th>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                    IP
                                                </th>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Innings Pitched</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                    RA
                                                </th>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Runs Allowed</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                    BB
                                                </th>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Base on Balls (Walks)</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                    SO
                                                </th>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Strikeouts</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <th className="px-4 py-3 text-sm font-medium text-gray-700 text-center">
                                                    ERA
                                                </th>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Earned Run Average
                                                    <br />
                                                    Average runs allowed per 9
                                                    innings
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <th className="px-4 py-3 text-sm font-medium text-gray-700"></th>
                                    </TooltipProvider>
                                </tr>
                            </thead>
                            <tbody>
                                {hasPitchingStats.map((p, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-t hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {p.playerName}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.inningsPitched}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.runsAllowed}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.walks}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.strikeouts}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.era}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-200 border-t">
                                    <td className="px-4 py-3">TOTALS</td>
                                    <td className="px-4 py-3 text-center">
                                        {totalInningsPitched}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {pitchingTotals.er}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {pitchingTotals.s}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {pitchingTotals.w}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {teamEra}
                                    </td>
                                    <td className="px-4 py-3 text-center"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
                    {data.team.name} vs {data.opponent.name}
                </h1>
                <h2 className="text-6xl font-extrabold text-center text-gray-700 mb-8">
                    {/* Team and Opponent Score and Logos in a row */}
                    <div className="flex justify-center items-center space-x-8">
                        {/* Team Logo and Score */}
                        <div className="flex items-center space-x-4">
                            {data.team.logo && (
                                <img
                                    src={data.team.logo}
                                    alt="Team Logo"
                                    className="w-16 h-16 rounded-full"
                                />
                            )}
                            <span className="font-semibold text-black">
                                {data.teamScore}
                            </span>
                        </div>

                        <span className="font-semibold text-black"> - </span>

                        {/* Opponent Score and Logo */}
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-black">
                                {data.opponentScore}
                            </span>
                            {data.opponent.logo && (
                                <img
                                    src={data.opponent.logo}
                                    alt="Opponent Logo"
                                    className="w-16 h-16 rounded-full"
                                />
                            )}
                        </div>
                    </div>
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                    {renderBattingTable(
                        data.team.name,
                        data.team.logo,
                        data.teamPlayers
                    )}
                    {renderBattingTable(
                        data.opponent.name,
                        data.opponent.logo,
                        data.opponentPlayers
                    )}
                </div>
                <div className="flex flex-col md:flex-row items-start gap-8 mt-10">
                    {renderPitchingTable(
                        data.team.name,
                        data.team.logo,
                        data.teamPlayers
                    )}
                    {renderPitchingTable(
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
