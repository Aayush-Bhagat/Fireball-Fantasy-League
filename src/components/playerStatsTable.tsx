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
import {
    calculateOBP,
    calculateSLG,
    calculateOPS,
    calculateWHIP,
    calculateBAA,
    calculateOBPAgainst,
    calculateSLGAgainst,
    calculateOPSAgainst,
} from "@/lib/statUtils";

type Props = {
    playersData: Promise<PlayerStatsResponseDto>;
};

/* ====================================================== */
/* Ranking Logic                                           */
/* ====================================================== */

/* ====================================================== */
/* Ranking Logic                                          */
/* ====================================================== */

function getTopBatters(players: PlayerWithStatsDto[], count = 5) {
    const qualifiedPlayers = players.filter((p) => p.stats);

    if (qualifiedPlayers.length === 0) {
        return [];
    }

    const getBattingStats = (player: PlayerWithStatsDto) => {
        const s = player.stats!;

        const atBats = s.atBats ?? 0;
        const hits = s.hits ?? 0;
        const walks = s.walksTaken ?? 0;
        const hitByPitch = s.hitByPitch ?? 0;
        const sacFlies = s.sacFlies ?? 0;

        const singles = s.singles ?? 0;
        const doubles = s.doubles ?? 0;
        const triples = s.triples ?? 0;
        const homeRuns = s.homeRuns ?? 0;

        const plateAppearances = s.plateAppearances ?? 0;
        const runs = s.runs ?? 0;
        const rbis = s.rbis ?? 0;

        const battingAverage = atBats > 0 ? hits / atBats : 0;

        const obp =
            calculateOBP(hits, walks, hitByPitch, atBats, sacFlies) ?? 0;

        const slg =
            calculateSLG(hits, singles, doubles, triples, homeRuns, atBats) ??
            0;

        const ops = calculateOPS(obp, slg) ?? 0;

        // Calculate directly from hit types
        const totalBases = singles + 2 * doubles + 3 * triples + 4 * homeRuns;

        const tbPerPA =
            plateAppearances > 0 ? totalBases / plateAppearances : 0;

        const rbiPerPA = plateAppearances > 0 ? rbis / plateAppearances : 0;

        const runsPerPA = plateAppearances > 0 ? runs / plateAppearances : 0;

        return {
            battingAverage,
            obp,
            slg,
            ops,
            totalBases,
            tbPerPA,
            rbiPerPA,
            runsPerPA,
            plateAppearances,
        };
    };

    const allStats = qualifiedPlayers.map(getBattingStats);

    const normalize = (value: number, values: number[]) => {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (max === min) return 100;

        return ((value - min) / (max - min)) * 100;
    };

    const opsValues = allStats.map((s) => s.ops);
    const battingAverageValues = allStats.map((s) => s.battingAverage);
    const rbiPerPAValues = allStats.map((s) => s.rbiPerPA);
    const tbPerPAValues = allStats.map((s) => s.tbPerPA);
    const runsPerPAValues = allStats.map((s) => s.runsPerPA);
    const paValues = allStats.map((s) => s.plateAppearances);

    return qualifiedPlayers
        .map((player, index) => {
            const stats = allStats[index];

            const opsScore = normalize(stats.ops, opsValues);

            const battingAverageScore = normalize(
                stats.battingAverage,
                battingAverageValues,
            );

            const rbiScore = normalize(stats.rbiPerPA, rbiPerPAValues);

            const tbScore = normalize(stats.tbPerPA, tbPerPAValues);

            const runsScore = normalize(stats.runsPerPA, runsPerPAValues);

            const volumeScore = normalize(stats.plateAppearances, paValues);

            const score =
                opsScore * 0.3 +
                battingAverageScore * 0.25 +
                rbiScore * 0.15 +
                tbScore * 0.15 +
                runsScore * 0.1 +
                volumeScore * 0.05;

            return {
                ...player,
                score,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

function getTopPitchers(players: PlayerWithStatsDto[], count = 5) {
    const qualifiedPlayers = players.filter((p) => {
        if (!p.stats) return false;

        const outsPitched = p.stats.outsPitched ?? 0;
        const gamesPlayed = p.stats.gamesPlayed ?? 0;

        // Must have > 0 IP and meet IP >= games played
        return outsPitched > 0 && outsPitched >= gamesPlayed * 3;
    });

    if (qualifiedPlayers.length === 0) {
        return [];
    }

    const getPitchingStats = (player: PlayerWithStatsDto) => {
        const s = player.stats!;

        const outsPitched = s.outsPitched ?? 0;
        const runsAllowed = s.runsAllowed ?? 0;
        const hitsAllowed = s.hitsAllowed ?? 0;
        const walks = s.walks ?? 0;

        const inningsPitched = outsPitched / 3;

        const era = inningsPitched > 0 ? (runsAllowed / inningsPitched) * 9 : 0;

        const whip = calculateWHIP(walks, hitsAllowed, outsPitched) ?? 0;

        const atBatsAgainst =
            s.battersFaced !== null && s.walks !== null && s.beanBalls !== null
                ? Math.max(0, s.battersFaced - s.walks - s.beanBalls)
                : null;

        const baa = calculateBAA(hitsAllowed, atBatsAgainst) ?? 0;

        const obpAgainst =
            calculateOBPAgainst(
                hitsAllowed,
                walks,
                atBatsAgainst,
                s.beanBalls ?? 0,
            ) ?? 0;

        const slgAgainst =
            calculateSLGAgainst(
                hitsAllowed,
                s.singlesAllowed ?? 0,
                s.doublesAllowed ?? 0,
                s.triplesAllowed ?? 0,
                s.homeRunsAllowed ?? 0,
                atBatsAgainst,
            ) ?? 0;

        const opsAgainst = calculateOPSAgainst(obpAgainst, slgAgainst) ?? 0;

        const strikeouts = s.strikeouts ?? 0;

        const gamesPlayed = s.gamesPlayed ?? 0;

        return {
            era,
            whip,
            baa,
            obpAgainst,
            slgAgainst,
            opsAgainst,
            strikeouts,
            inningsPitched,
            gamesPlayed,
        };
    };

    const allStats = qualifiedPlayers.map(getPitchingStats);

    const normalize = (
        value: number,
        values: number[],
        higherIsBetter = true,
    ) => {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (max === min) return 100;

        return higherIsBetter
            ? ((value - min) / (max - min)) * 100
            : ((max - value) / (max - min)) * 100;
    };

    const eraValues = allStats.map((s) => s.era);
    const whipValues = allStats.map((s) => s.whip);
    const baaValues = allStats.map((s) => s.baa);
    const obpAgainstValues = allStats.map((s) => s.obpAgainst);
    const slgAgainstValues = allStats.map((s) => s.slgAgainst);
    const inningsValues = allStats.map((s) => s.inningsPitched);
    const gamesValues = allStats.map((s) => s.gamesPlayed);
    const strikeoutValues = allStats.map((s) => s.strikeouts);

    return qualifiedPlayers
        .map((player, index) => {
            const stats = allStats[index];

            // Run prevention: 40%
            const eraScore = normalize(stats.era, eraValues, false);

            const whipScore = normalize(stats.whip, whipValues, false);

            const runPreventionScore = eraScore * 0.6 + whipScore * 0.4;

            // Contact suppression: 30%
            const baaScore = normalize(stats.baa, baaValues, false);

            const obpAgainstScore = normalize(
                stats.obpAgainst,
                obpAgainstValues,
                false,
            );

            const slgAgainstScore = normalize(
                stats.slgAgainst,
                slgAgainstValues,
                false,
            );

            const contactSuppressionScore =
                baaScore * 0.4 + obpAgainstScore * 0.3 + slgAgainstScore * 0.3;

            // Volume: 15%
            const inningsScore = normalize(
                stats.inningsPitched,
                inningsValues,
                true,
            );

            const gamesScore = normalize(stats.gamesPlayed, gamesValues, true);

            const volumeScore = inningsScore * 0.7 + gamesScore * 0.3;

            // Control: 10%
            const controlScore = normalize(stats.whip, whipValues, false);

            // Strikeouts: 5%
            const strikeoutScore = normalize(
                stats.strikeouts,
                strikeoutValues,
                true,
            );

            const score =
                runPreventionScore * 0.4 +
                contactSuppressionScore * 0.3 +
                volumeScore * 0.15 +
                controlScore * 0.1 +
                strikeoutScore * 0.05;

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
                                                        H
                                                    </th>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    <p>Hits</p>
                                                </TooltipContent>
                                            </Tooltip>
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
                                                    {player.stats.hits}
                                                </span>
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
