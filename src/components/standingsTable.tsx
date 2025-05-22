import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeasonScheduleResponseDto } from "@/dtos/gameDtos";
import { StandingsDto } from "@/dtos/teamDtos";

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
        teamId: string
    ): number | string {
        const allGames = scheduleData.schedule.flatMap((week) => week.games);
        const teamGames = allGames.filter(
            (game) => game.team.id === teamId || game.opponent.id === teamId
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
        scheduleData: SeasonScheduleResponseDto
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
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">RD</th>
                                </tr>
                            </thead>
                            <tbody className="w-full">
                                {sortTeams(standings.western, schedule).map(
                                    (team) => (
                                        <tr className="border-t" key={team.id}>
                                            <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                                {team.logo && (
                                                    <img
                                                        src={team.logo}
                                                        alt={`${team.name} logo`}
                                                        className="w-10 h-10 mr-2 rounded-full"
                                                    />
                                                )}

                                                {team.name}
                                            </td>
                                            <td className="px-8 sm:px-4 py-2">
                                                {team.wins}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.losses}
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
                                                    team.id
                                                ) || "-"}
                                            </td>
                                        </tr>
                                    )
                                )}
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
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">RD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortTeams(standings.eastern, schedule).map(
                                    (team) => (
                                        <tr className="border-t" key={team.id}>
                                            <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                                {team.logo && (
                                                    <img
                                                        src={team.logo}
                                                        alt={`${team.name} logo`}
                                                        className="w-10 h-10 mr-2 rounded-full"
                                                    />
                                                )}
                                                {team.name}
                                            </td>
                                            <td className="px-8 sm:px-4 py-2">
                                                {team.wins}
                                            </td>
                                            <td className="px-4 py-2">
                                                {team.losses}
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
                                                    team.id
                                                ) || "-"}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
