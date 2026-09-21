"use client";

import Link from "next/link";
import { X, ArrowUpRight, BarChart3 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";

import PlayerGameLog from "./playerGameLog";
import PlayerHistory from "./playerHistory";
import CareerStats from "./careerStats";
import PlayerAwards from "./playerAwards";

import { useQuery } from "@tanstack/react-query";
import { getCareerStats } from "@/requests/players";

type Props = {
    player: PlayerWithStatsDto;
    onClose?: () => void;
};

/* =========================================================
   TEAM THEMES
========================================================= */

type TeamTheme = {
    from: string;
    to: string;
};

const teamThemes: TeamTheme[] = [
    { from: "#1d4ed8", to: "#4338ca" },
    { from: "#dc2626", to: "#991b1b" },
    { from: "#059669", to: "#047857" },
    { from: "#7c3aed", to: "#5b21b6" },
    { from: "#ea580c", to: "#c2410c" },
    { from: "#0891b2", to: "#155e75" },
    { from: "#be123c", to: "#9f1239" },
    { from: "#ca8a04", to: "#a16207" },
    { from: "#475569", to: "#1e293b" },
    { from: "#0f766e", to: "#115e59" },
];

function getPlayerTheme(playerId: string): TeamTheme {
    let hash = 0;

    for (let i = 0; i < playerId.length; i++) {
        hash = (hash << 5) - hash + playerId.charCodeAt(i);
        hash |= 0;
    }

    return teamThemes[Math.abs(hash) % teamThemes.length];
}

/* =========================================================
   PLAYER CARD
========================================================= */

export default function PlayerCard({ player, onClose }: Props) {
    const { data: careerSeasons } = useQuery({
        queryKey: ["player-career-stats", player.id],
        queryFn: async () => {
            const res = await getCareerStats(player.id);
            return res.careerStats;
        },
        enabled: !!player.id,
    });

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

    const batting = player.batting ?? 0;
    const fielding = player.fielding ?? 0;
    const pitching = player.pitching ?? 0;
    const running = player.running ?? 0;

    const teamTheme = getPlayerTheme(player.id);

    const playedSeasons = careerSeasons?.filter(
        (season) =>
            season.atBats > 0 ||
            season.hits > 0 ||
            season.inningsPitched > 0 ||
            season.runsAllowed > 0,
    );

    const careerTotals = playedSeasons?.reduce(
        (acc, season) => {
            acc.atBats += season.atBats;
            acc.hits += season.hits;
            acc.homeRuns += season.homeRuns;
            acc.rbis += season.rbis;
            acc.runs += season.runs;

            acc.runsAllowed += season.runsAllowed;

            const seasonOuts = inningsToOuts(season.inningsPitched);

            acc.outsPitched += seasonOuts;
            acc.weightedEraSum += season.era * seasonOuts;

            return acc;
        },
        {
            atBats: 0,
            hits: 0,
            homeRuns: 0,
            rbis: 0,
            runs: 0,
            runsAllowed: 0,
            weightedEraSum: 0,
            outsPitched: 0,
        },
    );

    const careerAVG =
        careerTotals && careerTotals.atBats > 0
            ? (careerTotals.hits / careerTotals.atBats).toFixed(3)
            : "0.000";

    const careerERA =
        careerTotals && careerTotals.outsPitched > 0
            ? (careerTotals.weightedEraSum / careerTotals.outsPitched).toFixed(
                  2,
              )
            : "0.00";

    const careerIP = careerTotals ? outsToInnings(careerTotals.outsPitched) : 0;

    const ratings = [
        {
            label: "Batting",
            value: batting,
            icon: "/images/battingIcon.png",
        },
        {
            label: "Fielding",
            value: fielding,
            icon: "/images/fieldingIcon.png",
        },
        {
            label: "Pitching",
            value: pitching,
            icon: "/images/pitchingIcon.png",
        },
        {
            label: "Running",
            value: running,
            icon: "/images/runningIcon.png",
        },
    ];

    return (
        <div className="relative w-full max-h-[90vh] overflow-y-auto bg-white rounded-b-2xl border border-gray-200 border-t-0 shadow-2xl">
            {/* =================================================
                CLOSE BUTTON
            ================================================= */}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close player card"
                    className="
                        absolute
                        top-4
                        right-4
                        z-50
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/20
                        bg-black/20
                        text-white
                        backdrop-blur-md
                        shadow-lg
                        transition-all
                        duration-200
                        hover:bg-black/40
                        hover:scale-105
                        active:scale-95
                        focus:outline-none
                        focus:ring-2
                        focus:ring-white/70
                    "
                >
                    <X className="h-5 w-5" />
                </button>
            )}
            {/* =================================================
                HEADER
            ================================================= */}
            <div
                className="relative overflow-hidden text-white rounded-t-2xl"
                style={{
                    background: `linear-gradient(135deg, ${teamTheme.from}, ${teamTheme.to})`,
                }}
            >
                {/* Decorative Background Circles */}

                <div
                    className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20"
                    style={{
                        backgroundColor: teamTheme.to,
                    }}
                />

                <div
                    className="absolute -left-20 -bottom-32 w-72 h-72 rounded-full opacity-20"
                    style={{
                        backgroundColor: teamTheme.from,
                    }}
                />

                <div className="relative px-6 py-6 md:px-8 md:py-7">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* =================================================
                            PLAYER IMAGE
                        ================================================= */}

                        <div className="flex justify-center md:justify-start shrink-0">
                            {player.playerCardImage ? (
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />

                                    <img
                                        src={player.playerCardImage}
                                        alt={player.name}
                                        className="relative w-28 h-28 md:w-36 md:h-36"
                                    />
                                </div>
                            ) : player.image ? (
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />

                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        className="relative w-28 h-28 md:w-36 md:h-36 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-4xl font-bold">
                                        {player.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            PLAYER INFORMATION
                        ================================================= */}

                        <div className="flex-1 min-w-0 text-center md:text-left">
                            {/* Team / Position */}

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                                {player.team?.logo && (
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md p-1">
                                        <img
                                            src={player.team.logo}
                                            alt={`${player.team.name ?? "Team"} logo`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}

                                {player.team?.abbreviation && (
                                    <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold tracking-wide">
                                        {player.team.abbreviation}
                                    </span>
                                )}

                                {player.position && (
                                    <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-semibold">
                                        {player.position}
                                    </span>
                                )}
                            </div>

                            {/* Player Name */}

                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight truncate">
                                {player.name}
                            </h1>

                            {player.team?.name && (
                                <p className="mt-1 text-sm text-white/75">
                                    {player.team.name}
                                </p>
                            )}

                            {/* =================================================
                                FULL STATS BUTTON
                            ================================================= */}

                            <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-2">
                                <Link
                                    href={`/players/${player.id}/stats`}
                                    className="
                                        group
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-white
                                        px-4
                                        py-2
                                        text-sm
                                        font-bold
                                        text-slate-900
                                        shadow-md
                                        transition-all
                                        duration-200
                                        hover:-translate-y-0.5
                                        hover:shadow-lg
                                        active:translate-y-0
                                    "
                                >
                                    <BarChart3 className="h-4 w-4" />

                                    <span>Full Stats</span>

                                    <ArrowUpRight
                                        className="
                                            h-4
                                            w-4
                                            transition-transform
                                            duration-200
                                            group-hover:translate-x-0.5
                                            group-hover:-translate-y-0.5
                                        "
                                    />
                                </Link>
                            </div>

                            {/* =================================================
                                CAREER HIGHLIGHTS
                            ================================================= */}

                            <div className="grid grid-cols-3 gap-3 mt-6 max-w-md mx-auto md:mx-0">
                                <CareerHighlight
                                    value={player.stats.battingAverage.toFixed(
                                        3,
                                    )}
                                    label="AVG"
                                />

                                <CareerHighlight
                                    value={player.stats.homeRuns}
                                    label="HR"
                                />

                                <CareerHighlight
                                    value={player.stats.rbis}
                                    label="RBI"
                                />

                                <CareerHighlight
                                    value={player.stats.era.toFixed(2)}
                                    label="ERA"
                                />

                                <CareerHighlight
                                    value={player.stats.runsAllowed}
                                    label="RA"
                                />

                                <CareerHighlight
                                    value={player.stats.inningsPitched}
                                    label="IP"
                                />
                            </div>
                        </div>

                        {/* =================================================
                            RATINGS
                        ================================================= */}

                        <div className="w-full md:w-64 bg-black/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wider font-semibold text-white/70 mb-3">
                                Player Ratings
                            </p>

                            <div className="space-y-3">
                                {ratings.map((rating) => (
                                    <RatingBar
                                        key={rating.label}
                                        label={rating.label}
                                        value={rating.value}
                                        icon={rating.icon}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* =================================================
                CAREER STATS
            ================================================= */}
            <div className="px-5 md:px-8 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                        Career Stats
                    </h2>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                    <StatBox label="AVG" value={careerAVG} />

                    <StatBox label="HR" value={careerTotals?.homeRuns ?? 0} />

                    <StatBox label="RBI" value={careerTotals?.rbis ?? 0} />

                    <StatBox label="ERA" value={careerERA} />

                    <StatBox
                        label="RA"
                        value={careerTotals?.runsAllowed ?? 0}
                    />

                    <StatBox label="IP" value={careerIP} />
                </div>
            </div>
            {/* =================================================
                TABS
            ================================================= */}
            <div className="px-4 md:px-8 pb-6">
                <Tabs defaultValue="recent" className="w-full">
                    <TabsList className="w-full grid grid-cols-4 mt-5 bg-gray-100 p-1 rounded-xl">
                        <TabsTrigger
                            value="recent"
                            className="rounded-lg text-xs sm:text-sm"
                        >
                            Game Log
                        </TabsTrigger>

                        <TabsTrigger
                            value="career"
                            className="rounded-lg text-xs sm:text-sm"
                        >
                            Career
                        </TabsTrigger>

                        <TabsTrigger
                            value="history"
                            className="rounded-lg text-xs sm:text-sm"
                        >
                            History
                        </TabsTrigger>

                        <TabsTrigger
                            value="awards"
                            className="rounded-lg text-xs sm:text-sm"
                        >
                            Awards
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 min-h-[280px]">
                        <TabsContent value="recent" className="mt-0">
                            <PlayerGameLog player={player.id} />
                        </TabsContent>

                        <TabsContent value="career" className="mt-0">
                            <CareerStats player={player.id} />
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <PlayerHistory player={player.id} />
                        </TabsContent>

                        <TabsContent value="awards" className="mt-0">
                            <PlayerAwards player={player.id} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

/* =========================================================
   CAREER HIGHLIGHT
========================================================= */

function CareerHighlight({
    value,
    label,
}: {
    value: string | number;
    label: string;
}) {
    return (
        <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/10">
            <p className="text-lg font-bold">{value}</p>

            <p className="text-[10px] uppercase tracking-wider text-white/70">
                {label}
            </p>
        </div>
    );
}

/* =========================================================
   STAT BOX
========================================================= */

function StatBox({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-3 text-center">
            <p className="text-base md:text-lg font-bold text-gray-900">
                {value}
            </p>

            <p className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-500">
                {label}
            </p>
        </div>
    );
}

/* =========================================================
   RATING BAR
========================================================= */

function RatingBar({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <img src={icon} alt="" className="w-5 h-5 object-contain" />

                <span className="text-xs font-medium flex-1">{label}</span>

                <span className="text-xs font-bold">{value}</span>
            </div>

            <Progress
                value={value * 10}
                max={100}
                className="h-1.5 bg-white/25"
            />
        </div>
    );
}
