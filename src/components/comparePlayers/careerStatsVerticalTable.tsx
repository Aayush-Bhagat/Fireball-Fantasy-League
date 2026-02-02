"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCareerStats } from "@/requests/players";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Helpers
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
    playerA: string;
    playerB: string;
};

function useCareerTotals(player: string) {
    return useQuery({
        queryKey: ["career-stats", player],
        queryFn: async () => {
            const res = await getCareerStats(player);
            const seasons = res.careerStats;

            const totals = seasons.reduce(
                (acc, s) => {
                    acc.games += 1;
                    acc.atBats += s.atBats;
                    acc.hits += s.hits;
                    acc.homeRuns += s.homeRuns;
                    acc.rbis += s.rbis;

                    const outs = inningsToOuts(s.inningsPitched);
                    acc.outsPitched += outs;
                    acc.runsAllowed += s.runsAllowed;
                    acc.walks += s.walks;
                    acc.strikeouts += s.strikeouts ?? 0;
                    acc.weightedEraSum += s.era * outs;

                    return acc;
                },
                {
                    games: 0,
                    atBats: 0,
                    hits: 0,
                    homeRuns: 0,
                    rbis: 0,
                    outsPitched: 0,
                    runsAllowed: 0,
                    walks: 0,
                    strikeouts: 0,
                    weightedEraSum: 0,
                },
            );

            return {
                ...totals,
                avg:
                    totals.atBats > 0
                        ? (totals.hits / totals.atBats).toFixed(3)
                        : "0.000",
                era:
                    totals.outsPitched > 0
                        ? (totals.weightedEraSum / totals.outsPitched).toFixed(
                              2,
                          )
                        : "0.00",
                ip: outsToInnings(totals.outsPitched),
            };
        },
    });
}

export default function CareerStatsComparison({ playerA, playerB }: Props) {
    const a = useCareerTotals(playerA);
    const b = useCareerTotals(playerB);

    if (a.isLoading || b.isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <Tabs defaultValue="bat">
            <TabsList className="mb-4">
                <TabsTrigger value="bat">Batting</TabsTrigger>
                <TabsTrigger value="pitch">Pitching</TabsTrigger>
            </TabsList>

            {/* Batting */}
            <TabsContent value="bat">
                <ComparisonTable
                    playerA={playerA}
                    playerB={playerB}
                    rows={[
                        ["Games", a.data?.games ?? 0, b.data?.games ?? 0],
                        ["At Bats", a.data?.atBats ?? 0, b.data?.atBats ?? 0],
                        ["Hits", a.data?.hits ?? 0, b.data?.hits ?? 0],
                        [
                            "Home Runs",
                            a.data?.homeRuns ?? 0,
                            b.data?.homeRuns ?? 0,
                        ],
                        ["RBIs", a.data?.rbis ?? 0, b.data?.rbis ?? 0],
                        ["AVG", a.data?.avg ?? "0.000", b.data?.avg ?? "0.000"],
                    ]}
                />
            </TabsContent>

            {/* Pitching */}
            <TabsContent value="pitch">
                <ComparisonTable
                    playerA={playerA}
                    playerB={playerB}
                    rows={[
                        ["Games", a.data?.games ?? 0, b.data?.games ?? 0],
                        ["At Bats", a.data?.atBats ?? 0, b.data?.atBats ?? 0],
                        ["Hits", a.data?.hits ?? 0, b.data?.hits ?? 0],
                        [
                            "Home Runs",
                            a.data?.homeRuns ?? 0,
                            b.data?.homeRuns ?? 0,
                        ],
                        ["RBIs", a.data?.rbis ?? 0, b.data?.rbis ?? 0],
                        ["AVG", a.data?.avg ?? "0.000", b.data?.avg ?? "0.000"],
                    ]}
                />
            </TabsContent>
        </Tabs>
    );
}

/* ---------- ESPN-style table ---------- */

function ComparisonTable({
    playerA,
    playerB,
    rows,
}: {
    playerA: string;
    playerB: string;
    rows: [string, React.ReactNode, React.ReactNode][];
}) {
    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left"></th>
                        <th className="px-4 py-2 text-center font-semibold">
                            {playerA}
                        </th>
                        <th className="px-4 py-2 text-center font-semibold">
                            {playerB}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([label, a, b]) => (
                        <tr key={label} className="border-t">
                            <td className="px-4 py-2 font-medium text-gray-500">
                                {label}
                            </td>
                            <td className="px-4 py-2 text-center font-semibold">
                                {a}
                            </td>
                            <td className="px-4 py-2 text-center font-semibold">
                                {b}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
