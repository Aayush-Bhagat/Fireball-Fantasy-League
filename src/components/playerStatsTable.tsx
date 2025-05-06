"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Link from "next/link";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";

type Props = {
    players: PlayerWithStatsDto[];
};

// 🎯 Weighted sorting logic
function getTopBatters(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        hr: 3,
        rbi: 2,
        avg: 100,
    };

    return players
        .filter((p) => p.stats && p.stats.battingAverage !== undefined)
        .sort((a, b) => {
            const aScore =
                a.stats.homeRuns * weights.hr +
                a.stats.rbis * weights.rbi +
                a.stats.battingAverage * weights.avg;

            const bScore =
                b.stats.homeRuns * weights.hr +
                b.stats.rbis * weights.rbi +
                b.stats.battingAverage * weights.avg;

            return bScore - aScore;
        })
        .slice(0, count);
}

function getTopPitchers(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        era: -100,
        so: 2,
        ip: 1,
    };

    return players
        .filter((p) => p.stats && p.stats.era !== undefined && p.stats.era > 0)
        .sort((a, b) => {
            const aScore =
                a.stats.era * weights.era +
                a.stats.strikeouts * weights.so +
                a.stats.inningsPitched * weights.ip;

            const bScore =
                b.stats.era * weights.era +
                b.stats.strikeouts * weights.so +
                b.stats.inningsPitched * weights.ip;

            return bScore - aScore;
        })
        .slice(0, count);
}

export default function PlayerStatsTable({ players }: Props) {
    const topBatters = getTopBatters(players);
    const topPitchers = getTopPitchers(players);

    return (
        <div className="mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-lg bg-white">
            <div className="text-2xl font-bold pb-4">
                Top Players
                <Link href="/players">
                    <Button className="float-right bg-violet-700 hover:bg-violet-800">
                        View Players
                    </Button>
                </Link>
            </div>
            <Tabs defaultValue="bat" className="w-full">
                <TabsList>
                    <TabsTrigger value="bat">Batting</TabsTrigger>
                    <TabsTrigger value="pitch">Pitching</TabsTrigger>
                </TabsList>
                <TabsContent value="bat">
                    <table className="w-full text-sm md:text-base">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                                <th className="py-3 px-4 text-left">Player</th>
                                <th className="py-3 px-4 text-center">HR</th>
                                <th className="py-3 px-4 text-center">RBI</th>
                                <th className="py-3 px-4 text-center">AVG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topBatters.map((player) => (
                                <tr
                                    key={player.name}
                                    className="border-t hover:bg-gray-50 transition-all"
                                >
                                    <td className="py-3 px-4 flex items-center gap-3">
                                        {player.image && (
                                            <img
                                                src={player.image}
                                                alt={player.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span className="font-medium">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        {player.team.logo && (
                                            <img
                                                src={player.team.logo}
                                                alt={`${player.team.name} logo`}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span>{player.team.name}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.stats.homeRuns}
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.stats.rbis}
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono">
                                        {player.stats.battingAverage.toFixed(3)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TabsContent>
                <TabsContent value="pitch">
                    <table className="w-full text-sm md:text-base">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                                <th className="py-3 px-4 text-left">Player</th>
                                <th className="py-3 px-4 text-center">IP</th>
                                <th className="py-3 px-4 text-center">SO</th>
                                <th className="py-3 px-4 text-center">ERA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPitchers.map((player) => (
                                <tr
                                    key={player.name}
                                    className="border-t hover:bg-gray-50 transition-all"
                                >
                                    <td className="py-3 px-4 flex items-center gap-3">
                                        {player.image && (
                                            <img
                                                src={player.image}
                                                alt={player.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span className="font-medium">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        {player.team.logo && (
                                            <img
                                                src={player.team.logo}
                                                alt={`${player.team.name} logo`}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span>{player.team.name}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.stats.inningsPitched}
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.stats.strikeouts}
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono">
                                        {player.stats.era.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TabsContent>
            </Tabs>
        </div>
    );
}
