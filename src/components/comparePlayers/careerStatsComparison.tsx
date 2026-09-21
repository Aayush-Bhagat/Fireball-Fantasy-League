"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

interface SeasonStats {
    seasonId: number;

    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;

    inningsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;

    battingAverage: number;
    era: number;
}

interface CareerTotals {
    name: string;

    atBats: number;
    hits: number;
    homeRuns: number;
    rbis: number;

    outsPitched: number;
    runsAllowed: number;
    walks: number;
    strikeouts: number;

    careerAVG: number;
    careerHR: number;
    careerRBI: number;
    careerERA: number;
    ip: number;

    image?: string | null;

    seasons: SeasonStats[];
}

export default function CareerStatsComparison({
    playerA,
    playerB,
}: {
    playerA: CareerTotals;
    playerB: CareerTotals;
}) {
    /*
     * "career" means show career totals.
     *
     * Otherwise the value is a season ID.
     */
    const [selectedSeason, setSelectedSeason] = useState<string>("career");

    /*
     * Get every season that exists for either player.
     *
     * This is useful because Player A and Player B may not
     * have played the exact same seasons.
     */
    const availableSeasons = useMemo(() => {
        const seasonIds = new Set<number>();

        playerA.seasons.forEach((season) => {
            seasonIds.add(season.seasonId);
        });

        playerB.seasons.forEach((season) => {
            seasonIds.add(season.seasonId);
        });

        return Array.from(seasonIds).sort((a, b) => b - a);
    }, [playerA.seasons, playerB.seasons]);

    /*
     * Find the selected season for each player.
     */
    const seasonA = useMemo(() => {
        if (selectedSeason === "career") {
            return null;
        }

        return (
            playerA.seasons.find(
                (season) => season.seasonId === Number(selectedSeason),
            ) ?? null
        );
    }, [playerA.seasons, selectedSeason]);

    const seasonB = useMemo(() => {
        if (selectedSeason === "career") {
            return null;
        }

        return (
            playerB.seasons.find(
                (season) => season.seasonId === Number(selectedSeason),
            ) ?? null
        );
    }, [playerB.seasons, selectedSeason]);

    /*
     * Build the values that the table should display.
     */
    const statsA = seasonA
        ? {
              atBats: seasonA.atBats,
              hits: seasonA.hits,
              homeRuns: seasonA.homeRuns,
              rbis: seasonA.rbis,
              inningsPitched: seasonA.inningsPitched,
              runsAllowed: seasonA.runsAllowed,
              walks: seasonA.walks,
              strikeouts: seasonA.strikeouts,
              battingAverage: seasonA.battingAverage,
              era: seasonA.era,
          }
        : {
              atBats: playerA.atBats,
              hits: playerA.hits,
              homeRuns: playerA.homeRuns,
              rbis: playerA.rbis,
              inningsPitched: playerA.ip,
              runsAllowed: playerA.runsAllowed,
              walks: playerA.walks,
              strikeouts: playerA.strikeouts,
              battingAverage: playerA.careerAVG,
              era: playerA.careerERA,
          };

    const statsB = seasonB
        ? {
              atBats: seasonB.atBats,
              hits: seasonB.hits,
              homeRuns: seasonB.homeRuns,
              rbis: seasonB.rbis,
              inningsPitched: seasonB.inningsPitched,
              runsAllowed: seasonB.runsAllowed,
              walks: seasonB.walks,
              strikeouts: seasonB.strikeouts,
              battingAverage: seasonB.battingAverage,
              era: seasonB.era,
          }
        : {
              atBats: playerB.atBats,
              hits: playerB.hits,
              homeRuns: playerB.homeRuns,
              rbis: playerB.rbis,
              inningsPitched: playerB.ip,
              runsAllowed: playerB.runsAllowed,
              walks: playerB.walks,
              strikeouts: playerB.strikeouts,
              battingAverage: playerB.careerAVG,
              era: playerB.careerERA,
          };

    if (!playerA || !playerB) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    /*
     * The statistics to display.
     *
     * "inverse" means lower is better for the comparison
     * highlight. For example, ERA and Runs Allowed.
     */
    const rows: {
        label: string;
        valA: number | string;
        valB: number | string;
        inverse?: boolean;
    }[] = [
        {
            label: "At Bats",
            valA: statsA.atBats,
            valB: statsB.atBats,
        },
        {
            label: "Hits",
            valA: statsA.hits,
            valB: statsB.hits,
        },
        {
            label: "Home Runs",
            valA: statsA.homeRuns,
            valB: statsB.homeRuns,
        },
        {
            label: "RBIs",
            valA: statsA.rbis,
            valB: statsB.rbis,
        },
        {
            label: "AVG",
            valA: statsA.battingAverage.toFixed(3),
            valB: statsB.battingAverage.toFixed(3),
        },
        {
            label: "Innings Pitched",
            valA: statsA.inningsPitched,
            valB: statsB.inningsPitched,
        },
        {
            label: "Runs Allowed",
            valA: statsA.runsAllowed,
            valB: statsB.runsAllowed,
            inverse: true,
        },
        {
            label: "Walks",
            valA: statsA.walks,
            valB: statsB.walks,
        },
        {
            label: "Strikeouts",
            valA: statsA.strikeouts,
            valB: statsB.strikeouts,
        },
        {
            label: "ERA",
            valA: statsA.era.toFixed(2),
            valB: statsB.era.toFixed(2),
            inverse: true,
        },
    ];

    return (
        <div className="h-full overflow-hidden rounded-xl border bg-white shadow-lg">
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="border-b bg-purple-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">
                            Player Comparison
                        </h2>

                        <p className="text-xs text-gray-500">
                            {selectedSeason === "career"
                                ? "Career statistics"
                                : `Season ${selectedSeason} statistics`}
                        </p>
                    </div>

                    {/* Season selector */}
                    <div className="relative">
                        <select
                            value={selectedSeason}
                            onChange={(event) =>
                                setSelectedSeason(event.target.value)
                            }
                            className="
                                h-9
                                min-w-[130px]
                                cursor-pointer
                                appearance-none
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                pr-8
                                text-sm
                                font-medium
                                text-gray-700
                                shadow-sm
                                outline-none
                                transition
                                hover:bg-gray-50
                                focus:border-purple-500
                                focus:ring-2
                                focus:ring-purple-200
                            "
                        >
                            <option value="career">Career</option>

                            {availableSeasons.map((seasonId) => (
                                <option key={seasonId} value={seasonId}>
                                    Season {seasonId}
                                </option>
                            ))}
                        </select>

                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                PLAYER HEADER
            ===================================================== */}

            <div className="border-b bg-white">
                <div className="grid grid-cols-3">
                    <div />

                    <PlayerHeader player={playerA} />

                    <PlayerHeader player={playerB} />
                </div>
            </div>

            {/* =====================================================
                STATS
            ===================================================== */}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                    <tbody>
                        {rows.map(({ label, valA, valB, inverse }) => {
                            const aNumber = Number(valA);

                            const bNumber = Number(valB);

                            let betterA: boolean | null = null;

                            if (aNumber > bNumber) {
                                betterA = inverse ? false : true;
                            } else if (aNumber < bNumber) {
                                betterA = inverse ? true : false;
                            }

                            return (
                                <tr
                                    key={label}
                                    className="
                                            border-t
                                            transition-colors
                                            hover:bg-purple-50
                                        "
                                >
                                    <td className="w-1/3 px-4 py-3 font-medium text-gray-500">
                                        {label}
                                    </td>

                                    <td
                                        className={`
                                                px-4
                                                py-3
                                                text-center
                                                font-semibold
                                                ${
                                                    betterA === true
                                                        ? "font-bold text-green-600"
                                                        : "text-gray-900"
                                                }
                                            `}
                                    >
                                        {valA}
                                    </td>

                                    <td
                                        className={`
                                                px-4
                                                py-3
                                                text-center
                                                font-semibold
                                                ${
                                                    betterA === false
                                                        ? "font-bold text-green-600"
                                                        : "text-gray-900"
                                                }
                                            `}
                                    >
                                        {valB}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* =========================================================
   PLAYER HEADER
========================================================= */

function PlayerHeader({ player }: { player: CareerTotals }) {
    return (
        <div className="flex flex-col items-center gap-2 px-4 py-4 text-center">
            <span className="font-semibold text-purple-700">{player.name}</span>
        </div>
    );
}
