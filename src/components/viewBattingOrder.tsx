import { TeamLineupDto, TeamRosterDto } from "@/dtos/teamDtos";
import React from "react";

interface Props {
	battingLineup: Promise<TeamLineupDto>;
	lineupData: Promise<TeamLineupDto>;
	rosterData: Promise<TeamRosterDto>;
}

export default async function ViewBattingOrder({
	battingLineup,
	lineupData,
	rosterData,
}: Props) {
	const { battingOrder } = await battingLineup;
	const { fieldingLineup } = await lineupData;
	const { roster } = await rosterData;

	// Create a map from player ID to position
	const playerIdToPositionMap: Record<string, string> = {};
	Object.entries(fieldingLineup).forEach(([position, player]) => {
		if (player) {
			playerIdToPositionMap[player.id] = position;
		}
	});

	return (
		<div className="container mx-auto px-4">
			<h1 className="text-4xl font-bold text-center mb-10 text-blue-700">
				Batting Order
			</h1>
			<div className="flex flex-col gap-6">
				{battingOrder.map((player, index) => {
					const position = player?.id
						? playerIdToPositionMap[player.id]
						: undefined;
					return (
						<div
							key={`${player?.id}-${index}`}
							className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 flex items-center"
						>
							<span className="text-2xl font-bold text-blue-600 mr-6 w-8 text-center">
								{index + 1}
							</span>
							{player?.image && (
								<img
									src={player.image}
									alt={player.name}
									className="w-16 h-16 object-cover rounded-full mr-6"
								/>
							)}
							<div className="flex-1">
								<p className="text-lg font-semibold text-gray-800">
									{player?.name}
								</p>
								{position && (
									<p className="text-sm text-gray-500 mb-2">
										{position}
									</p>
								)}

								<div className="text-sm text-gray-600 space-x-4">
									<span>
										AVG:{" "}
										<span className="font-medium">
											{roster.find(
												(p) => p.id === player?.id
											)?.stats?.battingAverage ?? "N/A"}
										</span>
									</span>
									<span>
										HR:{" "}
										<span className="font-medium">
											{roster.find(
												(p) => p.id === player?.id
											)?.stats?.homeRuns ?? "N/A"}
										</span>
									</span>
									<span>
										RBI:{" "}
										<span className="font-medium">
											{roster.find(
												(p) => p.id === player?.id
											)?.stats?.rbis ?? "N/A"}
										</span>
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div className="pb-10" />
		</div>
	);
}
