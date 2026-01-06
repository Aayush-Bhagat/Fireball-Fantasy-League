import React, { useState } from "react";
import { getPlayerGameLogs } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllSeasons } from "@/requests/season";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
type Props = {
	player: string;
};

export default function PlayerGameLog({ player }: Props) {
	const [selectedSeason, setSelectedSeason] = useState<string | undefined>(
		undefined
	);

	const { data: playerGameLogs, isLoading } = useQuery({
		queryKey: ["player-game-logs", player, selectedSeason],
		queryFn: async () => {
			const res = await getPlayerGameLogs(player, selectedSeason);
			return res.games;
		},
	});
	const { data: seasons } = useQuery({
		queryKey: ["seasons"],
		queryFn: async () => {
			const res = await getAllSeasons();
			setSelectedSeason(res.seasons[0].id.toString());
			return res.seasons;
		},
	});
	const hasPitchingStats =
		playerGameLogs?.some(
			(game) =>
				game.stats.inningsPitched > 0 ||
				game.stats.runsAllowed > 0 ||
				game.stats.era > 0
		) ?? false;

	return (
		<div>
			<Tabs defaultValue="bat" className="w-full">
				<div className="flex justify-between">
					<TabsList>
						<TabsTrigger value="bat">Batting</TabsTrigger>
						{hasPitchingStats && (
							<TabsTrigger value="pitch">Pitching</TabsTrigger>
						)}
					</TabsList>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Season {selectedSeason}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Select Season</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup
								value={selectedSeason}
								onValueChange={setSelectedSeason}
							>
								{seasons?.map((season) => (
									<DropdownMenuRadioItem
										key={season.id}
										value={season.id.toString()}
									>
										Season {season.id}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<h2 className="text-lg font-semibold mb-2">Recent Game Log</h2>
				<TabsContent value="bat">
					<div className="overflow-x-auto rounded-lg">
						<table className="w-full table-fixed bg-white border border-gray-100 shadow text-sm">
							<thead className="bg-purple-600 text-white">
								<tr>
									<th className="p-2">Date</th>
									<th className="p-2">Opponent</th>
									<th className="p-2">AB</th>
									<th className="p-2">H</th>
									<th className="p-2">HR</th>
									<th className="p-2">RBI</th>
									<th className="p-2">R</th>
									<th className="p-2">AVG</th>
								</tr>
							</thead>
							<tbody>
								{playerGameLogs &&
									[...playerGameLogs]
										.sort(
											(a, b) =>
												new Date(
													b.playedAt!
												).getTime() -
												new Date(a.playedAt!).getTime()
										)
										.map((game, i) => (
											<tr
												key={i}
												className="even:bg-gray-50 text-center"
											>
												<td className="p-2 whitespace-nowrap">
													{(game.playedAt &&
														format(
															new Date(
																game.playedAt
															),
															"MM/dd"
														)) ||
														"TBD"}
												</td>
												<td className="p-2">
													{game.opponent.abbreviation}
												</td>
												<td className="p-2">
													{game.stats.atBats}
												</td>
												<td className="p-2">
													{game.stats.hits}
												</td>
												<td className="p-2">
													{game.stats.homeRuns}
												</td>
												<td className="p-2">
													{game.stats.rbis}
												</td>
												<td className="p-2">
													{game.stats.runs}
												</td>
												<td className="p-2">
													{game.stats.battingAverage.toFixed(
														3
													)}
												</td>
											</tr>
										))}
							</tbody>
						</table>
					</div>
				</TabsContent>
				{hasPitchingStats && (
					<TabsContent value="pitch">
						<div className="overflow-x-auto rounded-lg">
							{isLoading && <Loader2 className="animate-spin" />}
							<table className="w-full table-fixed bg-white border border-gray-100 shadow text-sm">
								<thead className="bg-purple-600 text-white">
									<tr>
										<th className="p-2">Date</th>
										<th className="p-2">Opponent</th>
										<th className="p-2">IP</th>
										<th className="p-2">RA</th>
										<th className="p-2">Walks</th>
										<th className="p-2">SO</th>
										<th className="p-2">ERA</th>
									</tr>
								</thead>
								<tbody>
									{playerGameLogs &&
										[...playerGameLogs]
											.sort(
												(a, b) =>
													new Date(
														b.playedAt!
													).getTime() -
													new Date(
														a.playedAt!
													).getTime()
											)
											.map((game, i) => (
												<tr
													key={i}
													className="even:bg-gray-50 text-center"
												>
													<td className="p-2 whitespace-nowrap">
														{(game.playedAt &&
															format(
																new Date(
																	game.playedAt
																),
																"MM/dd"
															)) ||
															"TBD"}
													</td>
													<td className="p-2">
														{
															game.opponent
																.abbreviation
														}
													</td>
													<td className="p-2">
														{
															game.stats
																.inningsPitched
														}
													</td>
													<td className="p-2">
														{game.stats.runsAllowed}
													</td>
													<td className="p-2">
														{game.stats.walks}
													</td>
													<td className="p-2">
														{game.stats.strikeouts}
													</td>

													<td className="p-2">
														{game.stats.era.toFixed(
															2
														)}
													</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
					</TabsContent>
				)}
			</Tabs>

			<div className="flex justify-center items-center mt-4">
				{isLoading && <Loader2 className="animate-spin text-lg" />}
			</div>
		</div>
	);
}
