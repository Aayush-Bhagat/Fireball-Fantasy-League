import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeasonScheduleResponseDto } from "@/dtos/gameDtos";
import { StandingsDto } from "@/dtos/teamDtos";
import Link from "next/link";

type Props = {
    standingsData: Promise<StandingsDto>;
    scheduleData: Promise<SeasonScheduleResponseDto>;
};

export default async function StandingTable({
    standingsData,
    scheduleData,
}: Props) {
    const standings = await standingsData;
    const schedule = await scheduleData;

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
    function getClinchStatus(
        team: { id: string; wins: number; losses: number; ties: number },
        allTeams: { id: string; wins: number; losses: number; ties: number }[],
        scheduleData: SeasonScheduleResponseDto,
    ): string {
        const TOTAL_GAMES = 10;
        const PLAYOFF_SPOTS = 3;

        const gamesPlayed = (t: typeof team) => t.wins + t.losses + t.ties;
        const gamesRemaining = (t: typeof team) => TOTAL_GAMES - gamesPlayed(t);

        const maxWins = (t: typeof team) => t.wins + gamesRemaining(t);

        // ---------- CLINCH PLAYOFFS (X) ----------
        // Assume our team loses every remaining game.
        const myWorstWins = team.wins;

        // Count how many teams could finish with at least as many wins.
        let teamsThatCanTieOrBeat = 0;

        for (const other of allTeams) {
            if (other.id === team.id) continue;

            if (maxWins(other) >= myWorstWins) {
                teamsThatCanTieOrBeat++;
            }
        }

        // If three other teams can still tie/pass us,
        // we can still finish 4th.
        const clinchedPlayoffs = teamsThatCanTieOrBeat < PLAYOFF_SPOTS;

        // ---------- CLINCH BYE (Z) ----------
        // Assume our team loses out.
        // If anyone can still tie/pass us, we haven't clinched #1.

        let clinchedBye = true;

        for (const other of allTeams) {
            if (other.id === team.id) continue;

            if (maxWins(other) >= myWorstWins) {
                clinchedBye = false;
                break;
            }
        }

        // If everyone has completed the season,
        // allow run differential to break ties.

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
    function ClinchLegend() {
        return (
            <div className="mt-4 text-sm text-gray-700 flex space-x-6">
                <div className="flex items-center space-x-1">
                    <span className="font-bold text-green-600">Z</span>
                    <span>– Clinched First Round Bye</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="font-bold text-blue-600">X</span>
                    <span>– Clinched Playoffs</span>
                </div>
            </div>
        );
    }
    function hasAnyClinch(teams: typeof sortedWest) {
        return teams.some((team) => {
            const clinch = getClinchStatus(team, teams, schedule);
            return clinch === "Z" || clinch === "X";
        });
    }
    const sortedWest = sortTeams(standings.western, schedule);
    const sortedEast = sortTeams(standings.eastern, schedule);

    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold">Standings</div>
            <Tabs defaultValue="west" className="w-full">
                <TabsList>
                    <TabsTrigger value="west">Western</TabsTrigger>
                    <TabsTrigger value="east">Eastern</TabsTrigger>
                </TabsList>
                <TabsContent className="" value="west">
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full text-center">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Team</th>
                                    <th className="px-4 py-2">W</th>
                                    <th className="px-4 py-2">L</th>
                                    <th className="px-4 py-2">T</th>
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">RD</th>
                                </tr>
                            </thead>
                            <tbody className="w-full">
                                {sortedWest.map((team) => {
                                    const clinch = getClinchStatus(
                                        team,
                                        sortedWest,
                                        schedule,
                                    );
                                    return (
                                        <tr className="border-t" key={team.id}>
                                            <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                                {team.logo && (
                                                    <Link
                                                        href={`/teams/${team.id}`}
                                                    >
                                                        <img
                                                            src={team.logo}
                                                            alt={`${team.name} logo`}
                                                            className="w-10 h-10 mr-2 rounded-full"
                                                        />
                                                    </Link>
                                                )}
                                                <span className="flex items-center">
                                                    <span>{team.name}</span>
                                                    {clinch && (
                                                        <sup
                                                            className={`ml-1 font-bold text-xs align-super ${
                                                                clinch === "Z"
                                                                    ? "text-green-600"
                                                                    : "text-blue-600"
                                                            }`}
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {clinch}
                                                        </sup>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-8 sm:px-4 py-2">
                                                {team.wins}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.losses}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.ties}
                                            </td>

                                            <td className="px-4 py-2">
                                                {team.wins + team.losses === 0
                                                    ? "0.000"
                                                    : (
                                                          team.wins /
                                                          (team.wins +
                                                              team.losses)
                                                      ).toFixed(3)}
                                            </td>
                                            <td className="px-4 py-2">
                                                {calculateRunDifferential(
                                                    schedule,
                                                    team.id,
                                                ) || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                <TabsContent value="east">
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full text-center">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Team</th>
                                    <th className="px-4 py-2">W</th>
                                    <th className="px-4 py-2">L</th>
                                    <th className="px-4 py-2">T</th>
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">RD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEast.map((team) => {
                                    const clinch = getClinchStatus(
                                        team,
                                        sortedEast,
                                        schedule,
                                    );
                                    return (
                                        <tr className="border-t" key={team.id}>
                                            <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                                {team.logo && (
                                                    <Link
                                                        href={`/teams/${team.id}`}
                                                    >
                                                        <img
                                                            src={team.logo}
                                                            alt={`${team.name} logo`}
                                                            className="w-10 h-10 mr-2 rounded-full"
                                                        />
                                                    </Link>
                                                )}
                                                <span className="flex items-center">
                                                    <span>{team.name}</span>
                                                    {clinch && (
                                                        <sup
                                                            className={`ml-1 font-bold text-xs align-super ${
                                                                clinch === "Z"
                                                                    ? "text-green-600"
                                                                    : "text-blue-600"
                                                            }`}
                                                            style={{
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {clinch}
                                                        </sup>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-8 sm:px-4 py-2">
                                                {team.wins}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.losses}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.ties}
                                            </td>

                                            <td className="px-4 py-2">
                                                {team.wins + team.losses === 0
                                                    ? "0.000"
                                                    : (
                                                          team.wins /
                                                          (team.wins +
                                                              team.losses)
                                                      ).toFixed(3)}
                                            </td>
                                            <td className="px-4 py-2">
                                                {calculateRunDifferential(
                                                    schedule,
                                                    team.id,
                                                ) || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                {(hasAnyClinch(sortedWest) || hasAnyClinch(sortedEast)) && (
                    <ClinchLegend />
                )}
            </Tabs>
        </div>
    );
}
