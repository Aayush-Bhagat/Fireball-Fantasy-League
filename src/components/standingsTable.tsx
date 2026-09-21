import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeasonScheduleResponseDto } from "@/dtos/gameDtos";
import { StandingsDto } from "@/dtos/teamDtos";
import Link from "next/link";
import { Button } from "./ui/button";
import { ChartColumn } from "lucide-react";

type Props = {
    standingsData: Promise<StandingsDto>;
    scheduleData: Promise<SeasonScheduleResponseDto>;
};

type Team = StandingsDto["western"][number];

export default async function StandingTable({
    standingsData,
    scheduleData,
}: Props) {
    const standings = await standingsData;
    const schedule = await scheduleData;

    /* -------------------------------------------------- */
    /* Run Differential                                   */
    /* -------------------------------------------------- */

    function calculateRunDifferential(
        scheduleData: SeasonScheduleResponseDto,
        teamId: string,
    ): number | string {
        const allGames = scheduleData.schedule.flatMap((week) => week.games);

        const teamGames = allGames.filter(
            (game) => game.team.id === teamId || game.opponent.id === teamId,
        );

        if (teamGames.length === 0) {
            return "-";
        }

        let pointsFor = 0;
        let pointsAgainst = 0;

        for (const game of teamGames) {
            if (game.team.id === teamId) {
                pointsFor += game.teamScore ?? 0;
                pointsAgainst += game.opponentScore ?? 0;
            } else {
                pointsFor += game.opponentScore ?? 0;
                pointsAgainst += game.teamScore ?? 0;
            }
        }

        return pointsFor - pointsAgainst;
    }

    /* -------------------------------------------------- */
    /* Sort Teams                                         */
    /* -------------------------------------------------- */

    function sortTeams(
        teams: StandingsDto["eastern" | "western"],
        scheduleData: SeasonScheduleResponseDto,
    ) {
        return teams
            .map((team) => {
                const totalGames = team.wins + team.losses;

                const pct = totalGames === 0 ? 0 : team.wins / totalGames;

                const rd = calculateRunDifferential(scheduleData, team.id);

                return {
                    ...team,
                    pct,
                    rd: typeof rd === "number" ? rd : -Infinity,
                };
            })
            .sort((a, b) => {
                if (b.pct !== a.pct) {
                    return b.pct - a.pct;
                }

                return b.rd - a.rd;
            });
    }

    /* -------------------------------------------------- */
    /* Clinch Logic                                       */
    /* -------------------------------------------------- */

    function getClinchStatus(
        team: {
            id: string;
            wins: number;
            losses: number;
            ties: number;
        },
        allTeams: {
            id: string;
            wins: number;
            losses: number;
            ties: number;
        }[],
        scheduleData: SeasonScheduleResponseDto,
    ): string {
        const TOTAL_GAMES = 10;
        const PLAYOFF_SPOTS = 3;

        const gamesPlayed = (t: typeof team) => t.wins + t.losses + t.ties;

        const gamesRemaining = (t: typeof team) => TOTAL_GAMES - gamesPlayed(t);

        const maxWins = (t: typeof team) => t.wins + gamesRemaining(t);

        /* ----------------------------- */
        /* Clinched Playoffs             */
        /* ----------------------------- */

        const myWorstWins = team.wins;

        let teamsThatCanTieOrBeat = 0;

        for (const other of allTeams) {
            if (other.id === team.id) continue;

            if (maxWins(other) >= myWorstWins) {
                teamsThatCanTieOrBeat++;
            }
        }

        const clinchedPlayoffs = teamsThatCanTieOrBeat < PLAYOFF_SPOTS;

        /* ----------------------------- */
        /* Clinched First Round Bye      */
        /* ----------------------------- */

        let clinchedBye = true;

        for (const other of allTeams) {
            if (other.id === team.id) continue;

            if (maxWins(other) >= myWorstWins) {
                clinchedBye = false;
                break;
            }
        }

        /* ----------------------------- */
        /* Season Finished               */
        /* ----------------------------- */

        const seasonFinished = allTeams.every((t) => gamesRemaining(t) === 0);

        if (seasonFinished) {
            const myRD = calculateRunDifferential(scheduleData, team.id);

            clinchedBye = true;

            for (const other of allTeams) {
                if (other.id === team.id) continue;

                if (other.wins > team.wins) {
                    clinchedBye = false;
                    break;
                }

                if (other.wins === team.wins) {
                    const otherRD = calculateRunDifferential(
                        scheduleData,
                        other.id,
                    );

                    if (
                        typeof myRD === "number" &&
                        typeof otherRD === "number" &&
                        otherRD >= myRD
                    ) {
                        clinchedBye = false;
                        break;
                    }
                }
            }
        }

        if (clinchedBye) return "Z";
        if (clinchedPlayoffs) return "X";

        return "";
    }

    /* -------------------------------------------------- */
    /* Sorted Conferences                                 */
    /* -------------------------------------------------- */

    const sortedWest = sortTeams(standings.western, schedule);

    const sortedEast = sortTeams(standings.eastern, schedule);

    /* -------------------------------------------------- */
    /* Helpers                                            */
    /* -------------------------------------------------- */

    function getStatusLabel(status: string) {
        if (status === "Z") {
            return {
                label: "Z",
                className: "bg-green-50 text-green-700 border-green-200",
            };
        }

        if (status === "X") {
            return {
                label: "X",
                className: "bg-blue-50 text-blue-700 border-blue-200",
            };
        }

        return null;
    }

    function hasAnyClinch(teams: Team[]) {
        return teams.some((team) => {
            const status = getClinchStatus(team, teams, schedule);

            return status === "Z" || status === "X";
        });
    }

    /* -------------------------------------------------- */
    /* Team Row                                           */
    /* -------------------------------------------------- */

    function TeamRow({
        team,
        allTeams,
        index,
    }: {
        team: Team;
        allTeams: Team[];
        index: number;
    }) {
        const clinch = getClinchStatus(team, allTeams, schedule);

        const status = getStatusLabel(clinch);

        const rd = calculateRunDifferential(schedule, team.id);

        const gamesPlayed = team.wins + team.losses;

        const pct =
            gamesPlayed === 0 ? "0.000" : (team.wins / gamesPlayed).toFixed(3);

        const playoffSpot = index < 3;

        return (
            <tr
                key={team.id}
                className="group border-t border-gray-100 transition-colors hover:bg-gray-50"
            >
                {/* Team */}
                <td className="px-2.5 py-2.5">
                    <Link
                        href={`/teams/${team.id}`}
                        className="flex items-center gap-2 min-w-0"
                    >
                        {/* Rank */}
                        <span
                            className={`w-4 text-center text-xs font-semibold ${
                                playoffSpot ? "text-gray-700" : "text-gray-400"
                            }`}
                        >
                            {index + 1}
                        </span>

                        {/* Logo */}
                        {team.logo ? (
                            <img
                                src={team.logo}
                                alt={`${team.name} logo`}
                                className="h-7 w-7 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-gray-200 shrink-0" />
                        )}

                        {/* Name */}
                        <span className="truncate text-sm font-medium text-gray-800 group-hover:text-violet-700 transition-colors">
                            {team.name}
                        </span>

                        {/* Clinch Badge */}
                        {status && (
                            <span
                                className={`hidden sm:inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${status.className}`}
                            >
                                {status.label}
                            </span>
                        )}

                        {/* Mobile Clinch */}
                        {clinch && (
                            <span
                                className={`sm:hidden text-[10px] font-bold ${
                                    clinch === "Z"
                                        ? "text-green-600"
                                        : "text-blue-600"
                                }`}
                            >
                                {clinch}
                            </span>
                        )}
                    </Link>
                </td>

                {/* W */}
                <td className="px-1 py-2.5 text-center">
                    <span className="font-semibold text-gray-900">
                        {team.wins}
                    </span>
                </td>

                {/* L */}
                <td className="px-1 py-2.5 text-center">
                    <span className="text-gray-600">{team.losses}</span>
                </td>

                {/* T */}
                <td className="px-1 py-2.5 text-center">
                    <span className="text-gray-600">{team.ties}</span>
                </td>

                {/* PCT */}
                <td className="px-1 py-2.5 text-center">
                    <span className="font-mono text-xs font-medium text-gray-700">
                        {pct}
                    </span>
                </td>

                {/* RD */}
                <td className="px-1 py-2.5 text-center">
                    <span
                        className={`font-mono text-xs font-semibold ${
                            typeof rd === "number"
                                ? rd > 0
                                    ? "text-green-600"
                                    : rd < 0
                                      ? "text-red-500"
                                      : "text-gray-600"
                                : "text-gray-400"
                        }`}
                    >
                        {rd === 0 ? "0" : rd}
                    </span>
                </td>
            </tr>
        );
    }

    /* -------------------------------------------------- */
    /* Table                                             */
    /* -------------------------------------------------- */

    function StandingsContent({ teams }: { teams: Team[] }) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="w-[50%] px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Team
                            </th>

                            <th className="w-[8%] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                W
                            </th>

                            <th className="w-[8%] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                L
                            </th>

                            <th className="w-[8%] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                T
                            </th>

                            <th className="w-[13%] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                PCT
                            </th>

                            <th className="w-[13%] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                RD
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {teams.map((team, index) => (
                            <TeamRow
                                key={team.id}
                                team={team}
                                allTeams={teams}
                                index={index}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    /* -------------------------------------------------- */
    /* Main Component                                     */
    /* -------------------------------------------------- */

    return (
        <div className="mx-auto p-4 space-y-3 font-sans border border-gray-200 rounded-lg shadow-md bg-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <ChartColumn className="h-5 w-5 text-violet-700" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            Standings
                        </h2>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Current season
                        </p>
                    </div>
                </div>
                <Link href="/standings">
                    <Button
                        size="sm"
                        className="bg-violet-700 hover:bg-violet-800 text-xs"
                    >
                        Full Standings
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="west" className="w-full">
                <TabsList className="grid w-full max-w-[220px] grid-cols-2 bg-gray-100 p-1">
                    <TabsTrigger
                        value="west"
                        className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Western
                    </TabsTrigger>

                    <TabsTrigger
                        value="east"
                        className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Eastern
                    </TabsTrigger>
                </TabsList>

                {/* Western */}
                <TabsContent value="west" className="mt-3">
                    <StandingsContent teams={sortedWest} />
                </TabsContent>

                {/* Eastern */}
                <TabsContent value="east" className="mt-3">
                    <StandingsContent teams={sortedEast} />
                </TabsContent>

                {/* Legend */}
                {(hasAnyClinch(sortedWest) || hasAnyClinch(sortedEast)) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-green-50 border border-green-200 px-1 font-bold text-green-600">
                                Z
                            </span>

                            <span>First Round Bye</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-50 border border-blue-200 px-1 font-bold text-blue-600">
                                X
                            </span>

                            <span>Playoffs Clinched</span>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    );
}
