import React from "react";
import { GameResponseDto } from "@/dtos/gameDtos";
import { format } from "date-fns";
import Link from "next/link";
interface Props {
	teamSchedule: Promise<GameResponseDto>;
	isAdmin?: boolean;
}
export default async function TeamSchedule({ teamSchedule, isAdmin }: Props) {
	const { games } = await teamSchedule;

	return (
		<div className="pb-20">
			<div className="text-2xl font-bold mb-4">Schedule</div>
			<ul>
				<div className="space-y-4">
					{games.map((game) => (
						<div key={game.gameId}>
							<Link
								href={
									isAdmin
										? `/admin/game/${game.gameId}`
										: `/game/${game.gameId}`
								}
							>
								<div className="flex flex-col sm:flex-row justify-between items-center border rounded-xl p-4 shadow hover:shadow-lg transition bg-white">
									{/* Date & Time */}

									<div className="text-sm text-gray-500 mb-2 sm:mb-0 w-full sm:w-[200px] text-center flex flex-col gap-1">
										<div>
											📅{" "}
											{(game.playedAt &&
												format(
													new Date(game.playedAt),
													"EEEE, MMMM do"
												)) ||
												"TBD"}{" "}
										</div>
										<div>
											⏰{" "}
											{(game.playedAt &&
												format(
													new Date(game.playedAt),
													"p"
												)) ||
												"TBD"}
										</div>
									</div>

									{/* Matchup */}
									<div className="flex items-center justify-center gap-4 flex-grow w-full sm:w-auto ">
										{/* Team */}
										<div className="flex items-center gap-2 w-[200px] text-left">
											{game.team.logo && (
												<img
													src={game.team.logo}
													alt="Team Logo"
													className="w-10 h-10 rounded-full border"
												/>
											)}
											<div>
												<div className="font-medium truncate">
													{game.team.name}
												</div>
												<div className="text-xs text-gray-400 font-medium">
													{game.teamWins} -{" "}
													{game.teamLosses}
												</div>
											</div>
										</div>

										{/* VS */}
										<div className="text-lg font-bold text-gray-600 w-[40px] text-center">
											vs
										</div>

										{/* Opponent */}
										<div className="flex items-center gap-2 w-[200px] justify-end text-right">
											<div>
												<div className="font-medium truncate">
													{game.opponent.name}
												</div>
												<div className="text-xs text-gray-400 font-medium">
													{game.opponentWins} -{" "}
													{game.opponentLosses}
												</div>
											</div>
											{game.opponent.logo && (
												<img
													src={game.opponent.logo}
													alt="Opponent Logo"
													className="w-10 h-10 rounded-full border"
												/>
											)}
										</div>
									</div>

									{/* Score */}
									<div className="mt-2 sm:mt-0 text-center text-purple-600 font-semibold text-sm sm:text-base w-full sm:w-[80px] ">
										{game.teamScore} - {game.opponentScore}
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</ul>
		</div>
	);
}
