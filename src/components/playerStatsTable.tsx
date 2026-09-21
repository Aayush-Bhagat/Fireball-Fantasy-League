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
import { ArrowUpRight, Users } from "lucide-react";

type Props = {
    playersData: Promise<PlayerStatsResponseDto>;
};

/* ====================================================== */
/* Ranking Logic                                           */
/* ====================================================== */

function getTopBatters(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        hr: 2,
        rbi: 1,
        avg: 2.5,
    };

    const validPlayers = players.filter(
        (p) => p.stats && p.stats.battingAverage !== undefined,
    );

    if (validPlayers.length === 0) {
        return [];
    }

    const maxHR = Math.max(...validPlayers.map((p) => p.stats.homeRuns ?? 0));

    const maxRBI = Math.max(...validPlayers.map((p) => p.stats.rbis ?? 0));

    const maxAVG = Math.max(
        ...validPlayers.map((p) => p.stats.battingAverage ?? 0),
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

            return {
                ...p,
                score,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

function getTopPitchers(players: PlayerWithStatsDto[], count = 5) {
    const weights = {
        era: -4,
        so: 0.15,
        ip: 2,
    };

    return players
        .filter(
            (p) =>
                p.stats &&
                p.stats.era !== undefined &&
                p.stats.inningsPitched >= p.stats.gamesPlayed,
        )
        .map((player) => {
            const score =
                player.stats.era * weights.era +
                player.stats.strikeouts * weights.so +
                player.stats.inningsPitched * weights.ip;

            return {
                ...player,
                score,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

/* ====================================================== */
/* Player Identity                                         */
/* ====================================================== */

function PlayerIdentity({
    player,
    rank,
}: {
    player: PlayerWithStatsDto;
    rank: number;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            {/* Rank */}
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    rank === 1
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : rank === 2
                          ? "bg-gray-100 text-gray-600 border border-gray-200"
                          : rank === 3
                            ? "bg-orange-50 text-orange-600 border border-orange-200"
                            : "bg-gray-50 text-gray-400 border border-gray-100"
                }`}
            >
                {rank}
            </div>

            {/* Player Image */}
            {player.image ? (
                <img
                    src={player.image}
                    alt={player.name}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-full border border-gray-200 bg-white object-cover shadow-sm"
                />
            ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-bold text-gray-400">
                    ?
                </div>
            )}

            {/* Player + Team */}
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-gray-800">
                        {player.name}
                    </span>
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    {player.team?.logo && (
                        <img
                            src={player.team.logo}
                            alt={`${player.team.name} logo`}
                            className="h-4 w-4 shrink-0 rounded-full"
                            loading="lazy"
                        />
                    )}

                    <span className="truncate text-xs text-gray-400">
                        {player.team?.name ?? "Free Agent"}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ====================================================== */
/* Main Component                                          */
/* ====================================================== */

export default async function PlayerStatsTable({ playersData }: Props) {
    const { players } = await playersData;

    const topBatters = getTopBatters(players);
    const topPitchers = getTopPitchers(players);

    return (
        <div className="mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <Users className="h-5 w-5 text-violet-700" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Top Players
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Season leaders
                        </p>
                    </div>
                </div>

                <Link href="/players">
                    <Button className="bg-violet-700 hover:bg-violet-800 gap-1.5">
                        View Players
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="bat" className="w-full">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger
                        value="bat"
                        className="px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Batting
                    </TabsTrigger>

                    <TabsTrigger
                        value="pitch"
                        className="px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Pitching
                    </TabsTrigger>
                </TabsList>

                {/* ================================================= */}
                {/* Batting                                           */}
                {/* ================================================= */}

                <TabsContent value="bat" className="mt-4">
                    {topBatters.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <TooltipProvider>
                                            <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Player
                                            </th>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-16 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
                                                        HR
                                                    </th>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Home Runs</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-16 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
                                                        RBI
                                                    </th>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Runs Batted In</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-20 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
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
                                    {topBatters.map((player, index) => (
                                        <tr
                                            key={player.name}
                                            className={`
                                                    border-b border-gray-100
                                                    transition-colors
                                                    hover:bg-violet-50/40
                                                    ${
                                                        index === 0
                                                            ? "bg-amber-50/20"
                                                            : ""
                                                    }
                                                `}
                                        >
                                            <td className="py-3 px-2">
                                                <PlayerIdentity
                                                    player={player}
                                                    rank={index + 1}
                                                />
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {player.stats.homeRuns}
                                                </span>
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {player.stats.rbis}
                                                </span>
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="font-mono text-sm font-semibold text-gray-700">
                                                    {player.stats.battingAverage.toFixed(
                                                        3,
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyPlayers />
                    )}
                </TabsContent>

                {/* ================================================= */}
                {/* Pitching                                          */}
                {/* ================================================= */}

                <TabsContent value="pitch" className="mt-4">
                    {topPitchers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <TooltipProvider>
                                            <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Player
                                            </th>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-16 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
                                                        IP
                                                    </th>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Innings Pitched</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-16 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
                                                        SO
                                                    </th>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Strikeouts</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <th className="w-20 py-3 px-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-help">
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
                                    {topPitchers.map((player, index) => (
                                        <tr
                                            key={player.name}
                                            className={`
                                                    border-b border-gray-100
                                                    transition-colors
                                                    hover:bg-violet-50/40
                                                    ${
                                                        index === 0
                                                            ? "bg-amber-50/20"
                                                            : ""
                                                    }
                                                `}
                                        >
                                            <td className="py-3 px-2">
                                                <PlayerIdentity
                                                    player={player}
                                                    rank={index + 1}
                                                />
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {
                                                        player.stats
                                                            .inningsPitched
                                                    }
                                                </span>
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {player.stats.strikeouts}
                                                </span>
                                            </td>

                                            <td className="py-3 px-2 text-center">
                                                <span className="font-mono text-sm font-semibold text-gray-700">
                                                    {player.stats.era.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyPlayers />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ====================================================== */
/* Empty State                                             */
/* ====================================================== */

function EmptyPlayers() {
    return (
        <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
            <Users className="mx-auto h-7 w-7 text-gray-300" />

            <p className="mt-2 text-sm font-medium text-gray-500">
                No player statistics available
            </p>

            <p className="mt-1 text-xs text-gray-400">
                Check back when games have been played.
            </p>
        </div>
    );
}
