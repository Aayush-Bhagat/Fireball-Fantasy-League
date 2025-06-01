import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Link from "next/link";
import { PlayerStatsResponseDto, PlayerWithStatsDto } from "@/dtos/playerDtos";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
type Props = {
    playersData: Promise<PlayerStatsResponseDto>;
};

// 🎯 Weighted sorting logic
function getTopBatters(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        hr: 2,
        rbi: 1,
        avg: 4,
    };

    const validPlayers = players.filter(
        (p) => p.stats && p.stats.battingAverage !== undefined
    );

    const maxHR = Math.max(...validPlayers.map((p) => p.stats.homeRuns ?? 0));
    const maxRBI = Math.max(...validPlayers.map((p) => p.stats.rbis ?? 0));
    const maxAVG = Math.max(
        ...validPlayers.map((p) => p.stats.battingAverage ?? 0)
    );

    return validPlayers
        .map((p) => {
            const { homeRuns = 0, rbis = 0, battingAverage = 0 } = p.stats;

            const normalizedHR = maxHR ? homeRuns / maxHR : 0;
            const normalizedRBI = maxRBI ? rbis / maxRBI : 0;
            const normalizedAVG = maxAVG ? battingAverage / maxAVG : 0;

            const score =
                normalizedHR * weights.hr +
                normalizedRBI * weights.rbi +
                normalizedAVG * weights.avg;

            return { ...p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

function getTopPitchers(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        era: -3,
        so: 2,
        ip: 2,
    };

    return players
        .filter(
            (p) =>
                p.stats &&
                p.stats.era !== undefined &&
                p.stats.inningsPitched > 0
        )
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

export default async function PlayerStatsTable({ playersData }: Props) {
    const { players } = await playersData;
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
                                <TooltipProvider>
                                    <th className="py-3 px-4 text-left">
                                        Player
                                    </th>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                HR
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Home Runs</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                RBI
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Runs Batted In</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                AVG
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Batting Average</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
                                                loading="lazy"
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span className="font-medium">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        {player.team?.logo && (
                                            <img
                                                src={player.team.logo}
                                                alt={`${player.team.name} logo`}
                                                className="w-6 h-6 rounded-full"
                                                loading="lazy"
                                            />
                                        )}
                                        <span>{player.team?.name}</span>
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
                                <TooltipProvider>
                                    <th className="py-3 px-4 text-left">
                                        Player
                                    </th>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                IP
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Innings Pitched</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                SO
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Strikeouts</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <th className="py-3 px-4 text-center">
                                                ERA
                                            </th>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Earned Run Average</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
                                        {player.team?.logo && (
                                            <img
                                                src={player.team.logo}
                                                alt={`${player.team.name} logo`}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span>{player.team?.name}</span>
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
