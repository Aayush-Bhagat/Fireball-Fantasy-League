"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTradeAssets } from "@/requests/trade";
import { getCareerStats } from "@/requests/players";
import { BasicPlayerDto } from "@/dtos/playerDtos";
import { Button } from "@/components/ui/button";
import PlayerSelect from "@/components/comparePlayers/playerSelect";
import CompareColumn from "@/components/comparePlayers/compareColumn";
import StatDeltaSummary from "@/components/comparePlayers/statDeltaSummary";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import CareerStatsComparison from "@/components/comparePlayers/careerStatsComparison";

interface CareerSeasonStats {
    atBats?: number;
    hits?: number;
    homeRuns?: number;
    rbis?: number;
    inningsPitched?: number;
    runsAllowed?: number;
    walks?: number;
    strikeouts?: number;
    era?: number;
}

interface CareerTotals {
    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;
    outsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;
    weightedEraSum: number;
}

interface CareerSummary {
    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;
    outsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;
    careerAVG: number;
    careerRBI: number;
    careerHR: number;
    careerERA: number;
    ip: number;
    avg: number;
    era: number;
}

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

function calculateCareerTotals(
    careerStats: CareerSeasonStats[] | null,
): CareerSummary | null {
    if (!careerStats) return null;

    const playedSeasons = careerStats.filter(
        (s) =>
            (s.atBats ?? 0) > 0 ||
            (s.hits ?? 0) > 0 ||
            (s.inningsPitched ?? 0) > 0 ||
            (s.runsAllowed ?? 0) > 0,
    );

    const totals = playedSeasons.reduce<CareerTotals>(
        (acc, season) => {
            acc.atBats += season.atBats ?? 0;
            acc.hits += season.hits ?? 0;
            acc.homeRuns += season.homeRuns ?? 0;
            acc.rbis += season.rbis ?? 0;

            const outs = inningsToOuts(season.inningsPitched ?? 0);
            acc.outsPitched += outs;
            acc.runsAllowed += season.runsAllowed ?? 0;
            acc.walks += season.walks ?? 0;
            acc.strikeouts += season.strikeouts ?? 0;
            acc.weightedEraSum += (season.era ?? 0) * outs;

            return acc;
        },
        {
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

    const avg = totals.atBats > 0 ? totals.hits / totals.atBats : 0;
    const era =
        totals.outsPitched > 0 ? totals.weightedEraSum / totals.outsPitched : 0;

    return {
        atBats: totals.atBats,
        hits: totals.hits,
        homeRuns: totals.homeRuns,
        rbis: totals.rbis,
        outsPitched: totals.outsPitched,
        runsAllowed: totals.runsAllowed,
        walks: totals.walks,
        strikeouts: totals.strikeouts,
        careerAVG: avg,
        careerRBI: totals.rbis,
        careerHR: totals.homeRuns,
        careerERA: era,
        ip: outsToInnings(totals.outsPitched),
        avg,
        era,
    };
}

export default function ComparePlayers({
    rightPlayerId,
    setRightPlayerId,
}: {
    rightPlayerId?: string | null;
    setRightPlayerId?: (id: string | null) => void;
}) {
    const [playerA, setPlayerA] = useState<BasicPlayerDto | null>(null);
    const [playerB, setPlayerB] = useState<BasicPlayerDto | null>(null);
    const [hasPrefilled, setHasPrefilled] = useState(false);

    const { data: tradeAssets, isLoading } = useQuery({
        queryKey: ["compare-player-assets"],
        queryFn: async () => {
            const supabase = createClient();
            const { data: user } = await supabase.auth.getUser();
            if (!user) return null;

            const token = (await supabase.auth.getSession()).data.session
                ?.access_token;
            if (!token) return null;

            return getTradeAssets(token);
        },
    });

    const allPlayers: BasicPlayerDto[] = useMemo(() => {
        if (!tradeAssets) return [];
        return [
            ...tradeAssets.teamAssets.players,
            ...tradeAssets.availableAssets.flatMap((t) => t.players),
        ];
    }, [tradeAssets]);
    const handleSelectPlayerA = (player: BasicPlayerDto | null) => {
        setPlayerA(player);
        if (setRightPlayerId) setRightPlayerId(player?.id ?? null);
    };
    useEffect(() => {
        if (!hasPrefilled && allPlayers.length > 0 && rightPlayerId) {
            const urlPlayer = allPlayers.find((p) => p.id === rightPlayerId);
            if (urlPlayer) setPlayerA(urlPlayer);
            setHasPrefilled(true);
        }
    }, [allPlayers, rightPlayerId, hasPrefilled]);

    const { data: careerA } = useQuery({
        queryKey: ["career-stats", playerA?.id],
        queryFn: async () => {
            if (!playerA) return null;
            const res = await getCareerStats(playerA.id);
            return calculateCareerTotals(res.careerStats);
        },
        enabled: !!playerA,
    });

    const { data: careerB } = useQuery({
        queryKey: ["career-stats", playerB?.id],
        queryFn: async () => {
            if (!playerB) return null;
            const res = await getCareerStats(playerB.id);
            return calculateCareerTotals(res.careerStats);
        },
        enabled: !!playerB,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center mt-20">
                <Loader2 className="animate-spin w-10 h-10 text-purple-600" />
            </div>
        );
    }

    if (!tradeAssets) {
        return (
            <div className="text-center mt-20 text-gray-500">
                Please log in to compare players.
            </div>
        );
    }

    const swapPlayers = () => {
        setPlayerA(playerB);
        setPlayerB(playerA);
    };

    return (
        <div className="mt-12 container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-purple-700">
                    Compare Players
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                    View stats, career highlights, and game logs side by side.
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-6">
                <div className="flex-1">
                    <PlayerSelect
                        label="Player A"
                        players={allPlayers}
                        selected={playerA}
                        onSelect={handleSelectPlayerA}
                        disabledId={playerB?.id}
                    />
                </div>

                <div className="flex justify-center md:self-center md:mt-6">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={swapPlayers}
                        disabled={!playerA || !playerB}
                        className="flex items-center gap-2 text-purple-700 hover:bg-purple-50"
                    >
                        <ArrowLeftRight className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1">
                    <PlayerSelect
                        label="Player B"
                        players={allPlayers}
                        selected={playerB}
                        onSelect={setPlayerB}
                        disabledId={playerA?.id}
                    />
                </div>
            </div>

            {careerA && careerB && playerA && playerB && (
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Career Stats Comparison */}
                    <div className="flex-1 h-full">
                        <div className="h-full">
                            <CareerStatsComparison
                                playerA={{
                                    ...careerA,
                                    name: playerA.name,
                                }}
                                playerB={{
                                    ...careerB,
                                    name: playerB.name,
                                }}
                            />
                        </div>
                    </div>
                    {/* Stat Delta Summary */}
                    <div className="flex-1 h-full">
                        <div className="h-full">
                            <StatDeltaSummary
                                playerA={{
                                    ...careerA,
                                    image: playerA.image ?? undefined,
                                }}
                                playerB={{
                                    ...careerB,
                                    image: playerB.image ?? undefined,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mb-20">
                <CompareColumn player={playerA} />
                <CompareColumn player={playerB} />
            </div>
        </div>
    );
}
