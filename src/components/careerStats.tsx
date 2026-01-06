"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCareerStats } from "@/requests/players";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Helpers for innings math
function inningsToOuts(ip: number): number {
    const whole = Math.floor(ip);
    const decimal = Number((ip - whole).toFixed(1));
    if (decimal === 0.1) return whole * 3 + 1;
    if (decimal === 0.2) return whole * 3 + 2;
    return whole * 3;
}

function outsToInnings(outs: number): number {
    const whole = Math.floor(outs / 3);
    const remainder = outs % 3;
    return Number(`${whole}.${remainder}`);
}

type Props = {
    player: string;
};

export default function CareerStats({ player }: Props) {
    const { data: playerCareerStats, isLoading } = useQuery({
        queryKey: ["player-caereer-stats", player],
        queryFn: async () => {
            const res = await getCareerStats(player);
            return res.careerStats;
        },
    });

    const hasPitchingStats =
        playerCareerStats?.some(
            (game) =>
                game.inningsPitched > 0 || game.runsAllowed > 0 || game.era > 0
        ) ?? false;

    // Filter out seasons with no meaningful stats
    const playedSeasons = playerCareerStats?.filter(
        (season) =>
            season.atBats > 0 ||
            season.hits > 0 ||
            season.inningsPitched > 0 ||
            season.runsAllowed > 0
    );

    // Calculate career totals
    const careerTotals = playedSeasons?.reduce(
        (acc, season) => {
            acc.atBats += season.atBats;
            acc.hits += season.hits;
            acc.homeRuns += season.homeRuns;
            acc.rbis += season.rbis;
            acc.runs += season.runs;

            const seasonOuts = inningsToOuts(season.inningsPitched);
            acc.outsPitched += seasonOuts;
            acc.runsAllowed += season.runsAllowed;
            acc.walks += season.walks;
            acc.strikeouts += season.strikeouts ?? 0;
            acc.weightedEraSum += season.era * seasonOuts;

            return acc;
        },
        {
            atBats: 0,
            hits: 0,
            homeRuns: 0,
            rbis: 0,
            runs: 0,
            outsPitched: 0,
            runsAllowed: 0,
            walks: 0,
            strikeouts: 0,
            weightedEraSum: 0,
        }
    );

    // Batting totals
    const careerAVG =
        careerTotals && careerTotals.atBats > 0
            ? (careerTotals.hits / careerTotals.atBats).toFixed(3)
            : "0.000";

    // Pitching totals
    const careerERA =
        careerTotals && careerTotals.outsPitched > 0
            ? (careerTotals.weightedEraSum / careerTotals.outsPitched).toFixed(
                  2
              )
            : "0.0";

    const careerIP = careerTotals ? outsToInnings(careerTotals.outsPitched) : 0;

    return (
        <div>
            <Tabs defaultValue="bat" className="w-full">
                <TabsList>
                    <TabsTrigger value="bat">Batting</TabsTrigger>
                    {hasPitchingStats && (
                        <TabsTrigger value="pitch">Pitching</TabsTrigger>
                    )}
                </TabsList>

                <h2 className="text-lg font-semibold mb-2">
                    Career Season Stats
                </h2>

                {/* Batting Tab */}
                <TabsContent value="bat">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
                            <thead className="bg-purple-600 text-white">
                                <tr>
                                    <th className="p-2">Year</th>
                                    <th className="p-2">Team</th>
                                    <th className="p-2">AB</th>
                                    <th className="p-2">H</th>
                                    <th className="p-2">HR</th>
                                    <th className="p-2">RBI</th>
                                    <th className="p-2">R</th>
                                    <th className="p-2">AVG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playedSeasons?.map((stat) => (
                                    <tr
                                        key={stat.seasonId}
                                        className="even:bg-gray-50 text-center"
                                    >
                                        <td className="p-2">{stat.seasonId}</td>
                                        <td className="p-2">
                                            {stat.teamsPlayedFor?.join(", ") ??
                                                "N/A"}
                                        </td>
                                        <td className="p-2">{stat.atBats}</td>
                                        <td className="p-2">{stat.hits}</td>
                                        <td className="p-2">{stat.homeRuns}</td>
                                        <td className="p-2">{stat.rbis}</td>
                                        <td className="p-2">{stat.runs}</td>
                                        <td className="p-2">
                                            {stat.battingAverage.toFixed(3)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Totals row */}
                                {careerTotals && (
                                    <tr className="bg-gray-200 font-bold text-center">
                                        <td className="p-2">Total</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2">
                                            {careerTotals.atBats}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.hits}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.homeRuns}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.rbis}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.runs}
                                        </td>
                                        <td className="p-2">{careerAVG}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* Pitching Tab */}
                <TabsContent value="pitch">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
                            <thead className="bg-purple-600 text-white">
                                <tr>
                                    <th className="p-2">Year</th>
                                    <th className="p-2">Team</th>
                                    <th className="p-2">IP</th>
                                    <th className="p-2">RA</th>
                                    <th className="p-2">Walks</th>
                                    <th className="p-2">SO</th>
                                    <th className="p-2">ERA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playedSeasons?.map((stat) => (
                                    <tr
                                        key={stat.seasonId}
                                        className="even:bg-gray-50 text-center"
                                    >
                                        <td className="p-2">{stat.seasonId}</td>
                                        <td className="p-2">
                                            {stat.teamsPlayedFor?.join(", ") ??
                                                "N/A"}
                                        </td>
                                        <td className="p-2">
                                            {stat.inningsPitched}
                                        </td>
                                        <td className="p-2">
                                            {stat.runsAllowed}
                                        </td>
                                        <td className="p-2">{stat.walks}</td>
                                        <td className="p-2">
                                            {stat.strikeouts ?? 0}
                                        </td>
                                        <td className="p-2">
                                            {stat.era.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Totals row */}
                                {careerTotals && (
                                    <tr className="bg-gray-200 font-bold text-center">
                                        <td className="p-2">Total</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2">{careerIP}</td>
                                        <td className="p-2">
                                            {careerTotals.runsAllowed}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.walks}
                                        </td>
                                        <td className="p-2">
                                            {careerTotals.strikeouts}
                                        </td>
                                        <td className="p-2">{careerERA}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {isLoading && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            )}
        </div>
    );
}
