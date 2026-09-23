import { GameStatsDto } from "@/dtos/gameDtos";
import { PlayerStatsWithIdDto } from "@/dtos/playerDtos";
import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Change this import path if your calculation file is somewhere else.
import {
    calculateEra,
    calculateInningsPitched,
    calculateOBP,
    calculateSLG,
    calculateOPS,
    calculateWHIP,
    calculateBAA,
    calculateOBPAgainst,
    calculateSLGAgainst,
    calculateOPSAgainst,
} from "@/lib/statUtils";

interface Props {
    boxScore: Promise<GameStatsDto>;
}

const STAT_PLACEHOLDER = "-";

/* =============================================================
   FORMATTING HELPERS
============================================================= */

const formatStat = (value: number | null | undefined): string | number => {
    return value === null || value === undefined ? STAT_PLACEHOLDER : value;
};

const formatRate = (value: number | null | undefined, decimals = 3): string => {
    if (value === null || value === undefined) {
        return STAT_PLACEHOLDER;
    }

    return value.toFixed(decimals);
};

/* =============================================================
   SUM HELPERS
============================================================= */

function sumNonNullable(
    stats: PlayerStatsWithIdDto[],
    key: keyof PlayerStatsWithIdDto,
): number {
    return stats.reduce((total, player) => {
        const value = player[key];

        return total + (typeof value === "number" ? value : 0);
    }, 0);
}

function sumNullable(
    stats: PlayerStatsWithIdDto[],
    key: keyof PlayerStatsWithIdDto,
): number | string {
    const values = stats
        .map((player) => player[key])
        .filter((value): value is number => typeof value === "number");

    if (values.length === 0) {
        return STAT_PLACEHOLDER;
    }

    return values.reduce((total, value) => total + value, 0);
}

/* =============================================================
   DERIVED STAT HELPERS
============================================================= */

function calculatePlayerBattingAverage(
    player: PlayerStatsWithIdDto,
): number | null {
    if (player.atBats <= 0) {
        return null;
    }

    return Number((player.hits / player.atBats).toFixed(3));
}

function calculatePlayerOBP(player: PlayerStatsWithIdDto): number | null {
    return calculateOBP(
        player.hits,
        player.walksTaken,
        player.hitByPitch,
        player.atBats,
        player.sacFlies,
    );
}

function calculatePlayerSLG(player: PlayerStatsWithIdDto): number | null {
    return calculateSLG(
        player.hits,
        player.singles,
        player.doubles,
        player.triples,
        player.homeRuns,
        player.atBats,
    );
}

function calculatePlayerOPS(player: PlayerStatsWithIdDto): number | null {
    const obp = calculatePlayerOBP(player);
    const slg = calculatePlayerSLG(player);

    return calculateOPS(obp, slg);
}

/*
 * Your DTO does not have a dedicated atBatsAgainst field.
 *
 * We can derive it from:
 *
 * BF - BB - HBP
 *
 * This assumes the available DTO does not separately track
 * sacrifice flies against.
 */
function calculateAtBatsAgainst(player: PlayerStatsWithIdDto): number | null {
    if (
        player.battersFaced === null ||
        player.walks === null ||
        player.beanBalls === null
    ) {
        return null;
    }

    const atBatsAgainst = player.battersFaced - player.walks - player.beanBalls;

    return Math.max(0, atBatsAgainst);
}

function calculatePlayerBAA(player: PlayerStatsWithIdDto): number | null {
    const atBatsAgainst = calculateAtBatsAgainst(player);

    return calculateBAA(player.hitsAllowed, atBatsAgainst);
}

function calculatePlayerOBPAgainst(
    player: PlayerStatsWithIdDto,
): number | null {
    const atBatsAgainst = calculateAtBatsAgainst(player);

    return calculateOBPAgainst(
        player.hitsAllowed,
        player.walks,
        atBatsAgainst,
        player.beanBalls,
    );
}

function calculatePlayerSLGAgainst(
    player: PlayerStatsWithIdDto,
): number | null {
    const atBatsAgainst = calculateAtBatsAgainst(player);

    return calculateSLGAgainst(
        player.hitsAllowed,
        player.singlesAllowed,
        player.doublesAllowed,
        player.triplesAllowed,
        player.homeRunsAllowed,
        atBatsAgainst,
    );
}

function calculatePlayerOPSAgainst(
    player: PlayerStatsWithIdDto,
): number | null {
    const obpAgainst = calculatePlayerOBPAgainst(player);
    const slgAgainst = calculatePlayerSLGAgainst(player);

    return calculateOPSAgainst(obpAgainst, slgAgainst);
}

/* =============================================================
   COMPONENT
============================================================= */

export const BoxScore = async ({ boxScore }: Props) => {
    const data = await boxScore;

    const teamScore = data.teamScore ?? 0;
    const opponentScore = data.opponentScore ?? 0;

    const hasScore =
        data.teamScore !== null &&
        data.teamScore !== undefined &&
        data.opponentScore !== null &&
        data.opponentScore !== undefined;

    /*
     * ============================================================
     * BATTING TABLE
     * ============================================================
     */

    const renderBattingTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const totals = {
            ab: sumNonNullable(stats, "atBats"),
            h: sumNonNullable(stats, "hits"),
            r: sumNonNullable(stats, "runs"),
            hr: sumNonNullable(stats, "homeRuns"),
            rbi: sumNonNullable(stats, "rbis"),
            singles: sumNullable(stats, "singles"),
            doubles: sumNullable(stats, "doubles"),
            triples: sumNullable(stats, "triples"),
            walksTaken: sumNonNullable(stats, "walksTaken"),
            strikeouts: sumNonNullable(stats, "strikeouts"),
            hbp: sumNullable(stats, "hitByPitch"),
            totalBases: sumNullable(stats, "totalBases"),
            sacFlies: sumNullable(stats, "sacFlies"),
        };

        const teamBA =
            totals.ab > 0 ? Number((totals.h / totals.ab).toFixed(3)) : null;

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Team Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {icon && (
                            <img
                                src={icon}
                                alt={`${teamName} logo`}
                                className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                            />
                        )}

                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                                {teamName}
                            </h2>

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Batting
                            </p>
                        </div>
                    </div>

                    <div className="hidden text-right sm:block">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Team AVG
                        </div>

                        <div className="text-lg font-bold text-slate-800">
                            {formatRate(teamBA)}
                        </div>
                    </div>
                </div>

                {/* Mobile Team AVG */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 sm:hidden">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Team AVG
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                        {formatRate(teamBA)}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <TableHeader label="Player" align="left" />

                                <TableHeader label="AB" tooltip="At Bats" />

                                <TableHeader label="H" tooltip="Hits" />

                                <TableHeader label="R" tooltip="Runs" />

                                <TableHeader
                                    label="RBI"
                                    tooltip="Runs Batted In"
                                />

                                <TableHeader label="HR" tooltip="Home Runs" />

                                <TableHeader label="1B" tooltip="Singles" />

                                <TableHeader label="2B" tooltip="Doubles" />

                                <TableHeader label="3B" tooltip="Triples" />

                                <TableHeader
                                    label="BB"
                                    tooltip="Base on Balls"
                                />

                                <TableHeader label="SO" tooltip="Strikeouts" />

                                <TableHeader
                                    label="HBP"
                                    tooltip="Hit By Pitch"
                                />

                                <TableHeader label="TB" tooltip="Total Bases" />

                                <TableHeader
                                    label="SF"
                                    tooltip="Sacrifice Flies"
                                />

                                <TableHeader
                                    label="BA"
                                    tooltip="Batting Average"
                                />
                            </tr>
                        </thead>

                        <tbody>
                            {stats.map((p, idx) => {
                                const battingAverage =
                                    calculatePlayerBattingAverage(p);

                                return (
                                    <tr
                                        key={`${p.playerName}-${idx}`}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                            {p.playerName}
                                        </td>

                                        <TableCell value={p.atBats} />
                                        <TableCell value={p.hits} />
                                        <TableCell value={p.runs} />
                                        <TableCell value={p.rbis} />
                                        <TableCell value={p.homeRuns} />
                                        <TableCell value={p.singles} />
                                        <TableCell value={p.doubles} />
                                        <TableCell value={p.triples} />
                                        <TableCell value={p.walksTaken} />
                                        <TableCell value={p.strikeouts} />
                                        <TableCell value={p.hitByPitch} />
                                        <TableCell value={p.totalBases} />
                                        <TableCell value={p.sacFlies} />

                                        <TableCell
                                            value={formatRate(battingAverage)}
                                        />
                                    </tr>
                                );
                            })}

                            <tr className="bg-slate-50 font-bold text-slate-800">
                                <td className="px-4 py-3">TOTALS</td>

                                <TableCell value={totals.ab} />
                                <TableCell value={totals.h} />
                                <TableCell value={totals.r} />
                                <TableCell value={totals.rbi} />
                                <TableCell value={totals.hr} />

                                <TableCell value={totals.singles} />
                                <TableCell value={totals.doubles} />
                                <TableCell value={totals.triples} />

                                <TableCell value={totals.walksTaken} />
                                <TableCell value={totals.strikeouts} />
                                <TableCell value={totals.hbp} />
                                <TableCell value={totals.totalBases} />
                                <TableCell value={totals.sacFlies} />

                                <TableCell value={formatRate(teamBA)} />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * ADVANCED BATTING TABLE
     * ============================================================
     */

    const renderAdvancedBattingTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const hasStats = stats.some(
            (p) =>
                p.plateAppearances !== null ||
                p.obp !== null ||
                p.slg !== null ||
                p.ops !== null ||
                p.strikeoutsBatted !== null ||
                p.oneHr !== null ||
                p.twoHr !== null ||
                p.threeHr !== null ||
                p.grandSlams !== null ||
                p.starsUsedBatting !== null,
        );

        if (!hasStats) {
            return null;
        }

        const totalAB = sumNonNullable(stats, "atBats");
        const totalHits = sumNonNullable(stats, "hits");
        const totalWalks = sumNonNullable(stats, "walks");

        const totalHBP = sumNullable(stats, "hitByPitch");
        const totalSF = sumNullable(stats, "sacFlies");
        const totalSingles = sumNullable(stats, "singles");
        const totalDoubles = sumNullable(stats, "doubles");
        const totalTriples = sumNullable(stats, "triples");
        const totalHR = sumNonNullable(stats, "homeRuns");

        const teamOBP = calculateOBP(
            totalHits,
            totalWalks,
            typeof totalHBP === "number" ? totalHBP : null,
            totalAB,
            typeof totalSF === "number" ? totalSF : null,
        );

        const teamSLG = calculateSLG(
            totalHits,
            typeof totalSingles === "number" ? totalSingles : null,
            typeof totalDoubles === "number" ? totalDoubles : null,
            typeof totalTriples === "number" ? totalTriples : null,
            totalHR,
            totalAB,
        );

        const teamOPS = calculateOPS(teamOBP, teamSLG);

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <img
                                src={icon}
                                alt={`${teamName} logo`}
                                className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                            />
                        )}

                        <div>
                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                {teamName}
                            </h2>

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Advanced Batting
                            </p>
                        </div>
                    </div>

                    <div className="hidden text-right sm:block">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Team OPS
                        </div>

                        <div className="text-lg font-bold text-slate-800">
                            {formatRate(teamOPS)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 sm:hidden">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Team OPS
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                        {formatRate(teamOPS)}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <TableHeader label="Player" align="left" />

                                <TableHeader
                                    label="PA"
                                    tooltip="Plate Appearances"
                                />

                                <TableHeader
                                    label="OBP"
                                    tooltip="On-Base Percentage"
                                />

                                <TableHeader
                                    label="SLG"
                                    tooltip="Slugging Percentage"
                                />

                                <TableHeader
                                    label="OPS"
                                    tooltip="On-Base Plus Slugging"
                                />

                                <TableHeader
                                    label="K-B"
                                    tooltip="Strikeouts Batted"
                                />

                                <TableHeader
                                    label="1-HR"
                                    tooltip="One-Run Home Runs"
                                />

                                <TableHeader
                                    label="2-HR"
                                    tooltip="Two-Run Home Runs"
                                />

                                <TableHeader
                                    label="3-HR"
                                    tooltip="Three-Run Home Runs"
                                />

                                <TableHeader label="GS" tooltip="Grand Slams" />

                                <TableHeader
                                    label="Stars"
                                    tooltip="Stars Used Batting"
                                />
                            </tr>
                        </thead>

                        <tbody>
                            {stats.map((p, idx) => {
                                const calculatedOBP = calculatePlayerOBP(p);

                                const calculatedSLG = calculatePlayerSLG(p);

                                const calculatedOPS = calculatePlayerOPS(p);

                                return (
                                    <tr
                                        key={`${p.playerName}-advanced-batting-${idx}`}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                            {p.playerName}
                                        </td>

                                        <TableCell
                                            value={formatStat(
                                                p.plateAppearances,
                                            )}
                                        />

                                        <TableCell
                                            value={formatRate(calculatedOBP)}
                                        />

                                        <TableCell
                                            value={formatRate(calculatedSLG)}
                                        />

                                        <TableCell
                                            value={formatRate(calculatedOPS)}
                                        />

                                        <TableCell
                                            value={formatStat(
                                                p.strikeoutsBatted,
                                            )}
                                        />

                                        <TableCell
                                            value={formatStat(p.oneHr)}
                                        />

                                        <TableCell
                                            value={formatStat(p.twoHr)}
                                        />

                                        <TableCell
                                            value={formatStat(p.threeHr)}
                                        />

                                        <TableCell
                                            value={formatStat(p.grandSlams)}
                                        />

                                        <TableCell
                                            value={formatStat(
                                                p.starsUsedBatting,
                                            )}
                                        />
                                    </tr>
                                );
                            })}

                            <tr className="bg-slate-50 font-bold text-slate-800">
                                <td className="px-4 py-3">TOTALS</td>

                                <TableCell
                                    value={sumNullable(
                                        stats,
                                        "plateAppearances",
                                    )}
                                />

                                <TableCell value={formatRate(teamOBP)} />

                                <TableCell value={formatRate(teamSLG)} />

                                <TableCell value={formatRate(teamOPS)} />

                                <TableCell
                                    value={sumNullable(
                                        stats,
                                        "strikeoutsBatted",
                                    )}
                                />

                                <TableCell
                                    value={sumNullable(stats, "oneHr")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "twoHr")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "threeHr")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "grandSlams")}
                                />

                                <TableCell
                                    value={sumNullable(
                                        stats,
                                        "starsUsedBatting",
                                    )}
                                />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * BASERUNNING TABLE
     * ============================================================
     */

    const renderBaserunningTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const hasStats = stats.some(
            (p) =>
                p.stolenBases !== null ||
                p.caughtStealing !== null ||
                p.stealAttempts !== null,
        );

        if (!hasStats) {
            return null;
        }

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                    {icon && (
                        <img
                            src={icon}
                            alt={`${teamName} logo`}
                            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                        />
                    )}

                    <div>
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            {teamName}
                        </h2>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Baserunning
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <TableHeader label="Player" align="left" />

                                <TableHeader
                                    label="SB"
                                    tooltip="Stolen Bases"
                                />

                                <TableHeader
                                    label="CS"
                                    tooltip="Caught Stealing"
                                />

                                <TableHeader
                                    label="ATT"
                                    tooltip="Steal Attempts"
                                />

                                <TableHeader
                                    label="SB%"
                                    tooltip="Stolen Base Percentage"
                                />
                            </tr>
                        </thead>

                        <tbody>
                            {stats.map((p, idx) => {
                                const sb = p.stolenBases;
                                const attempts = p.stealAttempts;

                                const sbPercentage =
                                    sb !== null &&
                                    attempts !== null &&
                                    attempts > 0
                                        ? `${((sb / attempts) * 100).toFixed(
                                              1,
                                          )}%`
                                        : STAT_PLACEHOLDER;

                                return (
                                    <tr
                                        key={`${p.playerName}-baserunning-${idx}`}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                            {p.playerName}
                                        </td>

                                        <TableCell
                                            value={formatStat(p.stolenBases)}
                                        />

                                        <TableCell
                                            value={formatStat(p.caughtStealing)}
                                        />

                                        <TableCell
                                            value={formatStat(p.stealAttempts)}
                                        />

                                        <TableCell value={sbPercentage} />
                                    </tr>
                                );
                            })}

                            <tr className="bg-slate-50 font-bold text-slate-800">
                                <td className="px-4 py-3">TOTALS</td>

                                <TableCell
                                    value={sumNullable(stats, "stolenBases")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "caughtStealing")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "stealAttempts")}
                                />

                                <TableCell
                                    value={calculateStealPercentage(stats)}
                                />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * FIELDING TABLE
     * ============================================================
     */

    const renderFieldingTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const hasStats = stats.some(
            (p) =>
                p.assist !== null ||
                p.fieldingErrors !== null ||
                p.buddyJumpPutouts !== null ||
                p.buddyJumpAttempts !== null ||
                p.doublePlays !== null ||
                p.triplePlays !== null ||
                p.bobbles !== null,
        );

        if (!hasStats) {
            return null;
        }

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                    {icon && (
                        <img
                            src={icon}
                            alt={`${teamName} logo`}
                            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                        />
                    )}

                    <div>
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            {teamName}
                        </h2>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Fielding
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <TableHeader label="Player" align="left" />

                                <TableHeader label="PO" tooltip="Putouts" />

                                <TableHeader label="A" tooltip="Assists" />

                                <TableHeader
                                    label="E"
                                    tooltip="Fielding Errors"
                                />

                                <TableHeader
                                    label="DP"
                                    tooltip="Double Plays"
                                />

                                <TableHeader
                                    label="TP"
                                    tooltip="Triple Plays"
                                />

                                <TableHeader
                                    label="BJ PO"
                                    tooltip="Buddy Jump Putouts"
                                />

                                <TableHeader
                                    label="BJ ATT"
                                    tooltip="Buddy Jump Attempts"
                                />

                                <TableHeader label="BOB" tooltip="Bobbles" />
                            </tr>
                        </thead>

                        <tbody>
                            {stats.map((p, idx) => (
                                <tr
                                    key={`${p.playerName}-fielding-${idx}`}
                                    className="border-b border-slate-100 transition hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                        {p.playerName}
                                    </td>

                                    <TableCell value={formatStat(p.outs)} />

                                    <TableCell value={formatStat(p.assist)} />

                                    <TableCell
                                        value={formatStat(p.fieldingErrors)}
                                    />

                                    <TableCell
                                        value={formatStat(p.doublePlays)}
                                    />

                                    <TableCell
                                        value={formatStat(p.triplePlays)}
                                    />

                                    <TableCell
                                        value={formatStat(p.buddyJumpPutouts)}
                                    />

                                    <TableCell
                                        value={formatStat(p.buddyJumpAttempts)}
                                    />

                                    <TableCell value={formatStat(p.bobbles)} />
                                </tr>
                            ))}

                            <tr className="bg-slate-50 font-bold text-slate-800">
                                <td className="px-4 py-3">TOTALS</td>

                                <TableCell value={sumNullable(stats, "outs")} />

                                <TableCell
                                    value={sumNullable(stats, "assist")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "fieldingErrors")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "doublePlays")}
                                />

                                <TableCell
                                    value={sumNullable(stats, "triplePlays")}
                                />

                                <TableCell
                                    value={sumNullable(
                                        stats,
                                        "buddyJumpPutouts",
                                    )}
                                />

                                <TableCell
                                    value={sumNullable(
                                        stats,
                                        "buddyJumpAttempts",
                                    )}
                                />

                                <TableCell
                                    value={sumNullable(stats, "bobbles")}
                                />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * PITCHING TABLE
     * ============================================================
     */

    const renderPitchingTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const pitchingStats = stats.filter(
            (player) =>
                player.outsPitched > 0 ||
                player.inningsPitched > 0 ||
                player.battersFaced !== null ||
                player.pitches !== null,
        );

        const totalOutsPitched = sumNonNullable(pitchingStats, "outsPitched");

        const totalRunsAllowed = sumNonNullable(pitchingStats, "runsAllowed");

        const totalWalks = sumNonNullable(pitchingStats, "walks");

        const totalStrikeouts = sumNonNullable(pitchingStats, "strikeouts");

        const totalInningsPitched = calculateInningsPitched(totalOutsPitched);

        const teamEra = calculateEra(totalRunsAllowed, totalOutsPitched);

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Team Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {icon && (
                            <img
                                src={icon}
                                alt={`${teamName} logo`}
                                className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                            />
                        )}

                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                                {teamName}
                            </h2>

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Pitching
                            </p>
                        </div>
                    </div>

                    <div className="hidden text-right sm:block">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Team ERA
                        </div>

                        <div className="text-lg font-bold text-slate-800">
                            {formatStat(teamEra)}
                        </div>
                    </div>
                </div>

                {/* Mobile ERA */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 sm:hidden">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Team ERA
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                        {formatStat(teamEra)}
                    </span>
                </div>

                {pitchingStats.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1300px] text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-white">
                                    <TableHeader label="Player" align="left" />

                                    <TableHeader
                                        label="IP"
                                        tooltip="Innings Pitched"
                                    />

                                    <TableHeader
                                        label="RA"
                                        tooltip="Runs Allowed"
                                    />

                                    <TableHeader label="BB" tooltip="Walks" />

                                    <TableHeader
                                        label="SO"
                                        tooltip="Strikeouts"
                                    />

                                    <TableHeader
                                        label="BF"
                                        tooltip="Batters Faced"
                                    />

                                    <TableHeader label="P" tooltip="Pitches" />

                                    <TableHeader label="S" tooltip="Strikes" />

                                    <TableHeader label="B" tooltip="Balls" />

                                    <TableHeader
                                        label="HB"
                                        tooltip="Bean Balls"
                                    />

                                    <TableHeader
                                        label="H"
                                        tooltip="Hits Allowed"
                                    />

                                    <TableHeader
                                        label="1B"
                                        tooltip="Singles Allowed"
                                    />

                                    <TableHeader
                                        label="2B"
                                        tooltip="Doubles Allowed"
                                    />

                                    <TableHeader
                                        label="3B"
                                        tooltip="Triples Allowed"
                                    />

                                    <TableHeader
                                        label="HR"
                                        tooltip="Home Runs Allowed"
                                    />

                                    <TableHeader
                                        label="IR"
                                        tooltip="Inherited Runs"
                                    />

                                    <TableHeader
                                        label="SP"
                                        tooltip="Star Pitches"
                                    />

                                    <TableHeader
                                        label="Stars"
                                        tooltip="Stars Used Pitching"
                                    />

                                    <TableHeader
                                        label="PK"
                                        tooltip="Pickoffs"
                                    />

                                    <TableHeader
                                        label="PK ATT"
                                        tooltip="Pickoff Attempts"
                                    />

                                    <TableHeader
                                        label="ERA"
                                        tooltip="Earned Run Average"
                                    />
                                </tr>
                            </thead>

                            <tbody>
                                {pitchingStats.map((p, idx) => {
                                    const playerERA =
                                        p.outsPitched > 0
                                            ? calculateEra(
                                                  p.runsAllowed,
                                                  p.outsPitched,
                                              )
                                            : null;

                                    const playerIP =
                                        p.outsPitched > 0
                                            ? calculateInningsPitched(
                                                  p.outsPitched,
                                              )
                                            : p.inningsPitched > 0
                                              ? p.inningsPitched
                                              : null;

                                    return (
                                        <tr
                                            key={`${p.playerName}-pitching-${idx}`}
                                            className="border-b border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                                {p.playerName}
                                            </td>

                                            <TableCell
                                                value={formatStat(playerIP)}
                                            />

                                            <TableCell value={p.runsAllowed} />

                                            <TableCell value={p.walks} />

                                            <TableCell value={p.strikeouts} />

                                            <TableCell
                                                value={formatStat(
                                                    p.battersFaced,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(p.pitches)}
                                            />

                                            <TableCell
                                                value={formatStat(p.strikes)}
                                            />

                                            <TableCell
                                                value={formatStat(p.balls)}
                                            />

                                            <TableCell
                                                value={formatStat(p.beanBalls)}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.hitsAllowed,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.singlesAllowed,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.doublesAllowed,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.triplesAllowed,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.homeRunsAllowed,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.inheritedRuns,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.starPitches,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.starsUsedPitching,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(p.pickoffs)}
                                            />

                                            <TableCell
                                                value={formatStat(
                                                    p.pickoffAttempts,
                                                )}
                                            />

                                            <TableCell
                                                value={formatStat(playerERA)}
                                            />
                                        </tr>
                                    );
                                })}

                                <tr className="bg-slate-50 font-bold text-slate-800">
                                    <td className="px-4 py-3">TOTALS</td>

                                    <TableCell value={totalInningsPitched} />

                                    <TableCell value={totalRunsAllowed} />

                                    <TableCell value={totalWalks} />

                                    <TableCell value={totalStrikeouts} />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "battersFaced",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "pitches",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "strikes",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "balls",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "beanBalls",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "hitsAllowed",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "singlesAllowed",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "doublesAllowed",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "triplesAllowed",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "homeRunsAllowed",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "inheritedRuns",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "starPitches",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "starsUsedPitching",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "pickoffs",
                                        )}
                                    />

                                    <TableCell
                                        value={sumNullable(
                                            pitchingStats,
                                            "pickoffAttempts",
                                        )}
                                    />

                                    <TableCell value={formatStat(teamEra)} />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            No pitching statistics available
                        </p>
                    </div>
                )}
            </div>
        );
    };

    /*
     * ============================================================
     * ADVANCED PITCHING TABLE
     * ============================================================
     */

    const renderAdvancedPitchingTable = (
        teamName: string,
        icon: string | null,
        stats: PlayerStatsWithIdDto[],
    ) => {
        const pitchingStats = stats.filter(
            (player) =>
                player.outsPitched > 0 ||
                player.inningsPitched > 0 ||
                player.battersFaced !== null,
        );

        if (pitchingStats.length === 0) {
            return null;
        }

        const totalWalks = sumNonNullable(pitchingStats, "walks");

        const totalHitsAllowed = sumNullable(pitchingStats, "hitsAllowed");

        const totalOutsPitched = sumNonNullable(pitchingStats, "outsPitched");

        const totalHBP = sumNullable(pitchingStats, "beanBalls");

        const totalBattersFaced = sumNullable(pitchingStats, "battersFaced");

        const totalSinglesAllowed = sumNullable(
            pitchingStats,
            "singlesAllowed",
        );

        const totalDoublesAllowed = sumNullable(
            pitchingStats,
            "doublesAllowed",
        );

        const totalTriplesAllowed = sumNullable(
            pitchingStats,
            "triplesAllowed",
        );

        const totalHomeRunsAllowed = sumNullable(
            pitchingStats,
            "homeRunsAllowed",
        );

        const atBatsAgainst =
            typeof totalBattersFaced === "number" &&
            typeof totalHBP === "number"
                ? totalBattersFaced - totalWalks - totalHBP
                : null;

        const teamBAA = calculateBAA(
            typeof totalHitsAllowed === "number" ? totalHitsAllowed : null,
            atBatsAgainst,
        );

        const teamOBPAgainst = calculateOBPAgainst(
            typeof totalHitsAllowed === "number" ? totalHitsAllowed : null,
            totalWalks,
            atBatsAgainst,
            typeof totalHBP === "number" ? totalHBP : null,
        );

        const teamSLGAgainst = calculateSLGAgainst(
            typeof totalHitsAllowed === "number" ? totalHitsAllowed : null,
            typeof totalSinglesAllowed === "number"
                ? totalSinglesAllowed
                : null,
            typeof totalDoublesAllowed === "number"
                ? totalDoublesAllowed
                : null,
            typeof totalTriplesAllowed === "number"
                ? totalTriplesAllowed
                : null,
            typeof totalHomeRunsAllowed === "number"
                ? totalHomeRunsAllowed
                : null,
            atBatsAgainst,
        );

        const teamOPSAgainst = calculateOPSAgainst(
            teamOBPAgainst,
            teamSLGAgainst,
        );

        const teamWHIP = calculateWHIP(
            totalWalks,
            typeof totalHitsAllowed === "number" ? totalHitsAllowed : null,
            totalOutsPitched,
        );

        const teamERA = calculateEra(
            sumNonNullable(pitchingStats, "runsAllowed"),
            totalOutsPitched,
        );

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <img
                                src={icon}
                                alt={`${teamName} logo`}
                                className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                            />
                        )}

                        <div>
                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                {teamName}
                            </h2>

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Advanced Pitching
                            </p>
                        </div>
                    </div>

                    <div className="hidden text-right sm:block">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Team WHIP
                        </div>

                        <div className="text-lg font-bold text-slate-800">
                            {formatRate(teamWHIP)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 sm:hidden">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Team WHIP
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                        {formatRate(teamWHIP)}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <TableHeader label="Player" align="left" />

                                <TableHeader
                                    label="WHIP"
                                    tooltip="Walks + Hits per Inning Pitched"
                                />

                                <TableHeader
                                    label="BAA"
                                    tooltip="Batting Average Against"
                                />

                                <TableHeader
                                    label="OBP-A"
                                    tooltip="On-Base Percentage Against"
                                />

                                <TableHeader
                                    label="SLG-A"
                                    tooltip="Slugging Percentage Against"
                                />

                                <TableHeader
                                    label="OPS-A"
                                    tooltip="On-Base Plus Slugging Against"
                                />

                                <TableHeader
                                    label="ERA"
                                    tooltip="Earned Run Average"
                                />
                            </tr>
                        </thead>

                        <tbody>
                            {pitchingStats.map((p, idx) => {
                                const playerWHIP = calculateWHIP(
                                    p.walks,
                                    p.hitsAllowed,
                                    p.outsPitched,
                                );

                                const playerBAA = calculatePlayerBAA(p);

                                const playerOBPAgainst =
                                    calculatePlayerOBPAgainst(p);

                                const playerSLGAgainst =
                                    calculatePlayerSLGAgainst(p);

                                const playerOPSAgainst =
                                    calculatePlayerOPSAgainst(p);

                                const playerERA = calculateEra(
                                    p.runsAllowed,
                                    p.outsPitched,
                                );

                                return (
                                    <tr
                                        key={`${p.playerName}-advanced-pitching-${idx}`}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                                            {p.playerName}
                                        </td>

                                        <TableCell
                                            value={formatRate(playerWHIP)}
                                        />

                                        <TableCell
                                            value={formatRate(playerBAA)}
                                        />

                                        <TableCell
                                            value={formatRate(playerOBPAgainst)}
                                        />

                                        <TableCell
                                            value={formatRate(playerSLGAgainst)}
                                        />

                                        <TableCell
                                            value={formatRate(playerOPSAgainst)}
                                        />

                                        <TableCell
                                            value={formatStat(playerERA)}
                                        />
                                    </tr>
                                );
                            })}

                            <tr className="bg-slate-50 font-bold text-slate-800">
                                <td className="px-4 py-3">TOTALS</td>

                                <TableCell value={formatRate(teamWHIP)} />

                                <TableCell value={formatRate(teamBAA)} />

                                <TableCell value={formatRate(teamOBPAgainst)} />

                                <TableCell value={formatRate(teamSLGAgainst)} />

                                <TableCell value={formatRate(teamOPSAgainst)} />

                                <TableCell value={formatStat(teamERA)} />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
     * ============================================================
     * GAME RESULT
     * ============================================================
     */

    const teamWon = hasScore && teamScore > opponentScore;

    const opponentWon = hasScore && opponentScore > teamScore;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
                <div className="mx-auto max-w-6xl">
                    {/* =====================================================
                        GAME HEADER
                    ====================================================== */}

                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="px-5 py-6 sm:px-8">
                            <div className="mb-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Box Score
                                </p>

                                <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                                    {data.team.name} vs {data.opponent.name}
                                </h1>
                            </div>

                            {/* Score */}
                            <div className="flex items-center justify-center gap-4 sm:gap-10">
                                {/* Team */}
                                <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-4">
                                    <div className="min-w-0 text-right">
                                        <div
                                            className={`truncate text-sm font-semibold sm:text-lg ${
                                                teamWon
                                                    ? "text-slate-900"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            {data.team.name}
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            {!hasScore
                                                ? "Upcoming"
                                                : teamWon
                                                  ? "Winner"
                                                  : opponentWon
                                                    ? "Loser"
                                                    : "Tie"}
                                        </div>
                                    </div>

                                    {data.team.logo && (
                                        <img
                                            src={data.team.logo}
                                            alt={`${data.team.name} logo`}
                                            className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover sm:h-16 sm:w-16"
                                        />
                                    )}
                                </div>

                                {/* Score */}
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`text-4xl font-extrabold sm:text-5xl ${
                                            teamWon
                                                ? "text-slate-900"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {hasScore ? teamScore : "—"}
                                    </span>

                                    <span className="text-2xl font-medium text-slate-300">
                                        -
                                    </span>

                                    <span
                                        className={`text-4xl font-extrabold sm:text-5xl ${
                                            opponentWon
                                                ? "text-slate-900"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {hasScore ? opponentScore : "—"}
                                    </span>
                                </div>

                                {/* Opponent */}
                                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                                    {data.opponent.logo && (
                                        <img
                                            src={data.opponent.logo}
                                            alt={`${data.opponent.name} logo`}
                                            className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover sm:h-16 sm:w-16"
                                        />
                                    )}

                                    <div className="min-w-0">
                                        <div
                                            className={`truncate text-sm font-semibold sm:text-lg ${
                                                opponentWon
                                                    ? "text-slate-900"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            {data.opponent.name}
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            {!hasScore
                                                ? "Upcoming"
                                                : opponentWon
                                                  ? "Winner"
                                                  : teamWon
                                                    ? "Loser"
                                                    : "Tie"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        BATTING
                    ====================================================== */}

                    <section>
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Batting
                            </h2>

                            <p className="text-sm text-slate-500">
                                Game batting statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderBattingTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderBattingTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>
                    {/* =====================================================
                        PITCHING
                    ====================================================== */}

                    <section className="mt-8">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Pitching
                            </h2>

                            <p className="text-sm text-slate-500">
                                Game pitching statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderPitchingTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderPitchingTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>

                    {/* =====================================================
                        ADVANCED BATTING
                    ====================================================== */}

                    <section className="mt-8">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Advanced Batting
                            </h2>

                            <p className="text-sm text-slate-500">
                                Plate discipline, power, and advanced batting
                                statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderAdvancedBattingTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderAdvancedBattingTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>
                    {/* =====================================================
                        ADVANCED PITCHING
                    ====================================================== */}

                    <section className="mt-8">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Advanced Pitching
                            </h2>

                            <p className="text-sm text-slate-500">
                                Pitching rate and opponent statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderAdvancedPitchingTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderAdvancedPitchingTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>

                    {/* =====================================================
                        BASERUNNING
                    ====================================================== */}

                    <section className="mt-8">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Baserunning
                            </h2>

                            <p className="text-sm text-slate-500">
                                Stolen bases and baserunning statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderBaserunningTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderBaserunningTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>

                    {/* =====================================================
                        FIELDING
                    ====================================================== */}

                    <section className="mt-8">
                        <div className="mb-3">
                            <h2 className="text-lg font-bold text-slate-900">
                                Fielding
                            </h2>

                            <p className="text-sm text-slate-500">
                                Defensive and fielding statistics
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {renderFieldingTable(
                                data.team.name,
                                data.team.logo,
                                data.teamPlayers,
                            )}

                            {renderFieldingTable(
                                data.opponent.name,
                                data.opponent.logo,
                                data.opponentPlayers,
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </TooltipProvider>
    );
};

/* =============================================================
   STEAL PERCENTAGE
============================================================= */

function calculateStealPercentage(stats: PlayerStatsWithIdDto[]): string {
    const stolenBases = sumNullable(stats, "stolenBases");

    const attempts = sumNullable(stats, "stealAttempts");

    if (
        typeof stolenBases !== "number" ||
        typeof attempts !== "number" ||
        attempts <= 0
    ) {
        return STAT_PLACEHOLDER;
    }

    return `${((stolenBases / attempts) * 100).toFixed(1)}%`;
}

/* =============================================================
   TABLE HEADER
============================================================= */

function TableHeader({
    label,
    tooltip,
    align = "center",
}: {
    label: string;
    tooltip?: string;
    align?: "left" | "center";
}) {
    const content = (
        <th
            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 ${
                align === "left" ? "text-left" : "text-center"
            }`}
        >
            {label}
        </th>
    );

    if (!tooltip) {
        return content;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>

            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

/* =============================================================
   TABLE CELL
============================================================= */

function TableCell({ value }: { value: string | number | null | undefined }) {
    return (
        <td className="px-4 py-3 text-center font-medium text-slate-600">
            {value === null || value === undefined ? STAT_PLACEHOLDER : value}
        </td>
    );
}

export default BoxScore;
