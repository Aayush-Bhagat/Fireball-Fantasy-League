"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsDto } from "@/dtos/teamDtos";
import { getStandings } from "@/requests/standings";

type Props = {
    standings: StandingsDto;
};
export default function StandingTable({ standings }: Props) {
    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold">Standings</div>
            <Tabs defaultValue="west" className="w-full">
                <TabsList>
                    <TabsTrigger value="west">Western</TabsTrigger>
                    <TabsTrigger value="east">Eastern</TabsTrigger>
                </TabsList>
                <TabsContent className="" value="west">
                    <div>
                        <table className="table-auto w-full text-center">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Team</th>
                                    <th className="px-4 py-2">W</th>
                                    <th className="px-4 py-2">L</th>
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">GP</th>
                                </tr>
                            </thead>
                            <tbody className="w-full">
                                {standings.western.map((team) => (
                                    <tr className="border-t" key={team.id}>
                                        <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                            {team.logo && (
                                                <img
                                                    src={team.logo}
                                                    alt={`${team.name} logo`}
                                                    className="w-10 h-10 mr-2 rounded-2xl"
                                                />
                                            )}

                                            {team.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.losses}
                                        </td>

                                        <td className="px-4 py-2">
                                            {(
                                                team.wins /
                                                (team.wins + team.losses)
                                            ).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins + team.losses}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                <TabsContent value="east">
                    <div>
                        <table className="table-auto w-full text-center">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Team</th>
                                    <th className="px-4 py-2">W</th>
                                    <th className="px-4 py-2">L</th>
                                    <th className="px-4 py-2">PCT</th>
                                    <th className="px-4 py-2">GP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.eastern.map((team) => (
                                    <tr className="border-t" key={team.id}>
                                        <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                            {team.logo && (
                                                <img
                                                    src={team.logo}
                                                    alt={`${team.name} logo`}
                                                    className="w-10 h-10 mr-2 rounded-2xl"
                                                />
                                            )}
                                            {team.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.losses}
                                        </td>

										<td className="px-4 py-2">
											{(
												team.wins /
												(team.wins + team.losses)
											).toFixed(3)}
										</td>
										<td className="px-4 py-2">
											{team.wins + team.losses}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
