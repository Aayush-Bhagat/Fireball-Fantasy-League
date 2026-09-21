"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getCareerStats, viewAllPlayers } from "@/requests/players";

import { BasicPlayerDto } from "@/dtos/playerDtos";

import { Button } from "@/components/ui/button";

import PlayerSelect from "@/components/comparePlayers/playerSelect";
import CompareColumn from "@/components/comparePlayers/compareColumn";
import StatDeltaSummary from "@/components/comparePlayers/statDeltaSummary";
import CareerStatsComparison from "@/components/comparePlayers/careerStatsComparison";

import { ArrowLeftRight, Loader2 } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface CareerSeasonStats {
    seasonId: number;

    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;

    inningsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;

    era: number;
    battingAverage: number;
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

    /**
     * Individual season statistics.
     */
    seasons: CareerSeasonStats[];
}

/* =========================================================
   INNINGS / OUTS HELPERS
========================================================= */

function inningsToOuts(ip: number): number {
    const whole = Math.floor(ip);
    const decimal = Number((ip - whole).toFixed(1));

    if (decimal === 0.1) {
        return whole * 3 + 1;
    }

    if (decimal === 0.2) {
        return whole * 3 + 2;
    }

    return whole * 3;
}

function outsToInnings(outs: number): number {
    const whole = Math.floor(outs / 3);
    const remainder = outs % 3;

    return Number(`${whole}.${remainder}`);
}

/* =========================================================
   CAREER TOTALS
========================================================= */

function calculateCareerTotals(
    careerStats: CareerSeasonStats[] | null,
): CareerSummary | null {
    if (!careerStats) {
        return null;
    }

    /*
     * Keep only seasons where the player actually recorded
     * some statistics.
     */
    const playedSeasons = careerStats.filter(
        (season) =>
            season.atBats > 0 ||
            season.hits > 0 ||
            season.homeRuns > 0 ||
            season.rbis > 0 ||
            season.inningsPitched > 0 ||
            season.runsAllowed > 0 ||
            season.walks > 0 ||
            season.strikeouts > 0,
    );

    const totals = playedSeasons.reduce<CareerTotals>(
        (acc, season) => {
            acc.atBats += season.atBats;
            acc.hits += season.hits;
            acc.homeRuns += season.homeRuns;
            acc.rbis += season.rbis;

            const outs = inningsToOuts(season.inningsPitched);

            acc.outsPitched += outs;

            acc.runsAllowed += season.runsAllowed;
            acc.walks += season.walks;
            acc.strikeouts += season.strikeouts;

            acc.weightedEraSum += season.era * outs;

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

        /*
         * This is the important new part.
         *
         * We preserve the individual seasons so the comparison
         * component can switch between them.
         */
        seasons: playedSeasons,
    };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ComparePlayers({
    PlayerAId,
    setPlayerAId,
}: {
    PlayerAId?: string | null;
    setPlayerAId?: (id: string | null) => void;
}) {
    const [playerA, setPlayerA] = useState<BasicPlayerDto | null>(null);

    const [playerB, setPlayerB] = useState<BasicPlayerDto | null>(null);

    const [hasPrefilled, setHasPrefilled] = useState(false);

    /* =========================================================
       ALL PLAYERS
    ========================================================= */

    const { data, isLoading } = useQuery({
        queryKey: ["all-players"],
        queryFn: viewAllPlayers,
    });

    const allPlayers: BasicPlayerDto[] = useMemo(() => {
        return data?.players ?? [];
    }, [data]);

    /* =========================================================
       PLAYER A SELECTION
    ========================================================= */

    const handleSelectPlayerA = (player: BasicPlayerDto | null) => {
        setPlayerA(player);

        if (setPlayerAId) {
            setPlayerAId(player?.id ?? null);
        }
    };

    /* =========================================================
       PREFILL PLAYER A FROM URL
    ========================================================= */

    useEffect(() => {
        if (!hasPrefilled && allPlayers.length > 0 && PlayerAId) {
            const urlPlayer = allPlayers.find(
                (player) => player.id === PlayerAId,
            );

            if (urlPlayer) {
                setPlayerA(urlPlayer);
            }

            setHasPrefilled(true);
        }
    }, [allPlayers, PlayerAId, hasPrefilled]);

    /* =========================================================
       PLAYER A CAREER STATS
    ========================================================= */

    const { data: careerA } = useQuery({
        queryKey: ["career-stats", playerA?.id],

        queryFn: async () => {
            if (!playerA) {
                return null;
            }

            const res = await getCareerStats(playerA.id);

            return calculateCareerTotals(res.careerStats);
        },

        enabled: !!playerA,
    });

    /* =========================================================
       PLAYER B CAREER STATS
    ========================================================= */

    const { data: careerB } = useQuery({
        queryKey: ["career-stats", playerB?.id],

        queryFn: async () => {
            if (!playerB) {
                return null;
            }

            const res = await getCareerStats(playerB.id);

            return calculateCareerTotals(res.careerStats);
        },

        enabled: !!playerB,
    });

    /* =========================================================
       LOADING
    ========================================================= */

    if (isLoading) {
        return (
            <div className="mt-20 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
        );
    }

    /* =========================================================
       NO PLAYERS
    ========================================================= */

    if (!allPlayers.length) {
        return (
            <div className="mt-20 text-center text-gray-500">
                No players available.
            </div>
        );
    }

    /* =========================================================
       SWAP
    ========================================================= */

    const swapPlayers = () => {
        setPlayerA(playerB);
        setPlayerB(playerA);

        /*
         * Keep the parent PlayerAId in sync as well.
         */
        if (setPlayerAId) {
            setPlayerAId(playerB?.id ?? null);
        }
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="container mx-auto mt-12 px-4">
            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-purple-700">
                    Compare Players
                </h1>

                <p className="mt-2 text-lg text-gray-600">
                    View stats, career highlights, and game logs side by side.
                </p>
            </div>

            {/* =====================================================
                PLAYER SELECTORS
            ===================================================== */}

            <div className="mb-6 flex flex-col items-start justify-center gap-4 md:flex-row">
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
                        className="
                            flex
                            items-center
                            gap-2
                            text-purple-700
                            hover:bg-purple-50
                        "
                    >
                        <ArrowLeftRight className="h-5 w-5" />
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

            {/* =====================================================
                CAREER / SEASON COMPARISON
            ===================================================== */}

            {careerA && careerB && playerA && playerB && (
                <div className="mb-8 flex flex-col gap-6 md:flex-row">
                    {/* Career / Season stats */}
                    <div className="flex-1">
                        <CareerStatsComparison
                            playerA={{
                                ...careerA,
                                name: playerA.name,
                                image: playerA.image,
                            }}
                            playerB={{
                                ...careerB,
                                name: playerB.name,
                                image: playerB.image,
                            }}
                        />
                    </div>

                    {/* Difference summary */}
                    <div className="flex-1">
                        <StatDeltaSummary
                            playerA={{
                                ...careerA,
                                image: playerA.image,
                            }}
                            playerB={{
                                ...careerB,
                                image: playerB.image,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* =====================================================
                PLAYER DETAILS
            ===================================================== */}

            <div className="mb-20 mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <CompareColumn player={playerA} />

                <CompareColumn player={playerB} />
            </div>
        </div>
    );
}
