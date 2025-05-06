"use client";
import PlayerCard from "./playerCard";
import React, { use, useState } from "react";
import { TeamRosterDto } from "@/dtos/teamDtos";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
interface Props {
	rosterData: Promise<TeamRosterDto>;
}
export default function TeamRoster({ rosterData }: Props) {
	const [selectedPlayer, setSelectedPlayer] =
		useState<PlayerWithStatsDto | null>(null);
	const [showCard, setShowCard] = useState(false);

	const { roster } = use(rosterData);

	const handlePlayerClick = (player: PlayerWithStatsDto) => {
		setSelectedPlayer(player);
		setShowCard(true);
	};
	return (
		<div className="min-h-screen bg-gray-100 font-sans ">
			{showCard && selectedPlayer && (
				<div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
					<div className="relative">
						<PlayerCard player={selectedPlayer} />
						<button
							className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8"
							onClick={() => setShowCard(false)}
						>
							✕
						</button>
					</div>
				</div>
			)}

			{/* Buttons */}
			{/* <div className="flex gap-3 justify-center">
                <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => router.push("/editLineup")}
                >
                    Edit Lineup
                </Button>
                <Button
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={() => router.push("/trade")}
                >
                    Trade
                </Button>
            </div> */}

			{/* Roster Table */}
			<div className="px-6 flex justify-center">
				<div className="w-full max-w-6xl">
					<h2 className="text-2xl font-semibold text-blue-800 mb-4">
						Team
					</h2>
					<div className="overflow-x-auto shadow-lg rounded-lg bg-white border border-gray-200">
						<table className="w-full table-auto text-left">
							<thead className="bg-blue-50 text-blue-800">
								<tr>
									<th className="px-6 py-3">Player</th>
									<th className="px-6 py-3">AVG</th>
									<th className="px-6 py-3">HR</th>
									<th className="px-6 py-3">RBI</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{roster.map((player, index) => (
									<tr
										key={index}
										className="hover:bg-gray-50 transition cursor-pointer"
										onClick={() =>
											handlePlayerClick(player)
										}
									>
										<td className="px-6 py-4 flex items-center gap-4">
											{player.image && (
												<img
													src={player.image}
													alt={player.name}
													className="w-10 h-10 rounded-full border border-gray-300"
													style={{
														transform: "scaleX(-1)",
													}}
												/>
											)}

											<div>
												<div className="font-medium text-gray-900">
													{player.name}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 font-mono">
											{player.stats.battingAverage.toFixed(
												3
											)}
										</td>
										<td className="px-6 py-4 font-mono">
											{player.stats.homeRuns}
										</td>
										<td className="px-6 py-4 font-mono">
											{player.stats.rbis}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
