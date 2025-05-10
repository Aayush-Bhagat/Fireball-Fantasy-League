import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCareerStats } from "@/requests/players";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type Props = {
	player: string;
};
export default function CareerStats({ player }: Props) {
	const { data: playerCareerStats, isLoading } = useQuery({
		queryKey: ["player-caereer-stats", player],
		queryFn: async () => {
			const res = await getCareerStats(player);
			return res.careerStats;
		},
	});
	const hasPitchingStats =
		playerCareerStats?.some(
			(game) =>
				game.inningsPitched > 0 || game.runsAllowed > 0 || game.era > 0
		) ?? false;
	return (
		<div>
			<Tabs defaultValue="bat" className="w-full">
				<TabsList>
					<TabsTrigger value="bat">Batting</TabsTrigger>
					{hasPitchingStats && (
						<TabsTrigger value="pitch">Pitching</TabsTrigger>
					)}
				</TabsList>
				<h2 className="text-lg font-semibold mb-2">
					Career Season Stats
				</h2>
				<TabsContent value="bat">
					<div className="overflow-x-auto">
						<table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
							<thead className="bg-purple-600 text-white">
								<tr>
									<th className="p-2">Year</th>
									<th className="p-2">Team</th>
									<th className="p-2">AB</th>
									<th className="p-2">H</th>
									<th className="p-2">HR</th>
									<th className="p-2">RBI</th>
									<th className="p-2">R</th>
									<th className="p-2">AVG</th>
								</tr>
							</thead>
							<tbody>
								{playerCareerStats &&
									playerCareerStats.map((stat) => (
										<tr
											key={stat.seasonId}
											className="even:bg-gray-50 text-center"
										>
											<td className="p-2">
												{stat.seasonId}
											</td>
											<td className="p-2">
												{stat.teamsPlayedFor
													? stat.teamsPlayedFor.join(
															", "
													  )
													: "N/A"}
											</td>
											<td className="p-2">
												{stat.atBats}
											</td>
											<td className="p-2">{stat.hits}</td>
											<td className="p-2">
												{stat.homeRuns}
											</td>
											<td className="p-2">{stat.rbis}</td>
											<td className="p-2">{stat.runs}</td>
											<td className="p-2">
												{stat.battingAverage.toFixed(3)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</TabsContent>
				<TabsContent value="pitch">
					<div className="overflow-x-auto">
						<table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
							<thead className="bg-purple-600 text-white">
								<tr>
									<th className="p-2">Year</th>
									<th className="p-2">Team</th>
									<th className="p-2">IP</th>
									<th className="p-2">RA</th>
									<th className="p-2">Walks</th>
									<th className="p-2">SO</th>
									<th className="p-2">ERA</th>
								</tr>
							</thead>
							<tbody>
								{playerCareerStats &&
									playerCareerStats.map((stat) => (
										<tr
											key={stat.seasonId}
											className="even:bg-gray-50 text-center"
										>
											<td className="p-2">
												{stat.seasonId}
											</td>
											<td className="p-2">
												{stat.teamsPlayedFor
													? stat.teamsPlayedFor.join(
															", "
													  )
													: "N/A"}
											</td>
											<td className="p-2">
												{stat.inningsPitched}
											</td>
											<td className="p-2">
												{stat.runsAllowed}
											</td>
											<td className="p-2">
												{stat.walks}
											</td>
											<td className="p-2">
												{stat.strikeouts}
											</td>
											<td className="p-2">
												{stat.era.toFixed(2)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</TabsContent>
			</Tabs>
			{isLoading && (
				<div className="flex justify-center items-center h-full">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			)}
		</div>
	);
}
