"use client";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWeeklySchedule } from "@/requests/schedule";
import { format } from "date-fns";
import { GameResponseDto } from "@/dtos/gameDtos";
import { useQuery } from "@tanstack/react-query";
import ScheduleTableSkeleton from "@/components/loaders/ScheduleTableSkeleton";

type Props = {
	gamesData: Promise<GameResponseDto>;
};

export default function ScheduleTable({ gamesData }: Props) {
	const [selectedWeek, setSelectedWeek] = useState("current");
	const router = useRouter();

	const { games } = React.use(gamesData);

	const { data: schedule, isLoading } = useQuery({
		queryKey: ["weekly-schedule", selectedWeek],
		queryFn: async () => {
			const res = await getWeeklySchedule(selectedWeek, "current");
			return res.games;
		},
		initialData: games,
	});

	if (isLoading) {
		return <ScheduleTableSkeleton />;
	}

	return (
		<div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
			<div className="text-2xl font-bold">
				Schedule
				<Button
					className="float-right bg-violet-700 hover:bg-violet-800"
					onClick={() => router.push("/schedule")}
				>
					Full Schedule
				</Button>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">Week {selectedWeek}</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Select Week</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={selectedWeek}
						onValueChange={(value) => setSelectedWeek(value)}
						defaultValue={"current"}
					>
						<DropdownMenuRadioItem value="current">
							Current Week
						</DropdownMenuRadioItem>
						{Array.from({ length: 7 }, (_, i) => (
							<DropdownMenuRadioItem
								key={i}
								value={(i + 1).toString()}
							>
								Week {i + 1}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<table className="w-full table-auto border-collapse">
				<thead>
					<tr className="bg-gray-100 text-center text-sm text-gray-600">
						<th className="p-2">Week</th>
						<th className="p-2">Date</th>
						<th className="p-2">Matchup</th>
						<th className="p-2">Result</th>
					</tr>
				</thead>
				<tbody>
					{schedule &&
						schedule.map((game, index) => (
							<tr
								key={index}
								className="border-t text-sm text-center"
							>
								<td className="p-2 pb-4">{game.week}</td>
								<td className="p-2 pb-4">
									<div className="text-sm text-gray-500 mb-2 sm:mb-0 w-full  text-center flex flex-col gap-1 xxl:flex-row ">
										<div>
											{(game.playedAt &&
												format(
													new Date(game.playedAt),
													"EEEE, MMMM do"
												)) ||
												"TBD"}{" "}
										</div>
										<div>
											{(game.playedAt &&
												format(
													new Date(game.playedAt),
													"p"
												)) ||
												"TBD"}
										</div>
									</div>
								</td>
								{/* <td className="p-2 pb-4">
                                    {(game.playedAt &&
                                        format(new Date(game.playedAt), "p")) ||
                                        "TBD"}
                                </td> */}

								<td className="p-2 pb-4">
									<div className="flex items-center justify-center gap-4">
										{/* Team */}
										<div className="flex items-center gap-2 w-[160px] text-left">
											{game.team.logo && (
												<img
													src={game.team.logo}
													alt="Team Logo"
													className="w-6 h-6 rounded-full border"
												/>
											)}
											<span className="truncate font-medium">
												{game.team.name}
											</span>
										</div>

										{/* vs */}
										<span className="text-gray-500 font-semibold">
											@
										</span>

										{/* Opponent */}
										<div className="flex items-center gap-2 w-[160px] justify-end text-right">
											<span className="truncate font-medium">
												{game.opponent.name}
											</span>
											{game.opponent.logo && (
												<img
													src={game.opponent.logo}
													alt="Opponent Logo"
													className="w-6 h-6 rounded-full border"
												/>
											)}
										</div>
									</div>
								</td>

								<td className="p-2">
									{(game.teamScore != null &&
										game.opponentScore != null &&
										`${game.teamScore} - ${game.opponentScore}`) ||
										"-"}
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}
