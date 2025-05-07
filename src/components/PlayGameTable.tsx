import { cn } from "@/lib/utils";
import AdminNumberField from "./ui/numberInput";
import { PlayerStats, PlayerStatsAction } from "./hooks/playerStatsReducer";
import { Dispatch } from "react";
type Props = {
	roster: PlayerStats[];
	color?: "red" | "blue";
	dispatch: Dispatch<PlayerStatsAction>;
};

const PlayGameTable = ({ roster, color, dispatch }: Props) => {
	return (
		<div className="overflow-x-auto">
			<table
				className={cn(
					"w-full table-auto bg-gray-50 shadow rounded-lg",
					color === "red" ? "bg-red-50" : "bg-blue-50"
				)}
			>
				<thead
					className={cn(
						color === "red"
							? "bg-red-200 text-red-900"
							: "bg-blue-200 text-blue-900"
					)}
				>
					<tr>
						<th className="text-left px-4 py-2 w-20">Player</th>

						<th className="text-center px-4 py-2 w-12">AB</th>
						<th className="text-center px-4 py-2 w-12">H</th>
						<th className="text-center px-4 py-2 w-12">R</th>
						<th className="text-center px-4 py-2 w-12">Rbi</th>
						<th className="text-center px-4 py-2 w-12">HR</th>
						<th className="text-center px-4 py-2 w-12">
							Outs Pitched
						</th>
						<th className="text-center px-4 py-2 w-12">RA</th>
						<th className="text-center px-4 py-2 w-12">SO</th>
						<th className="text-center px-4 py-2 w-12">Walks</th>
						<th className="text-center px-4 py-2 w-12">Outs</th>
					</tr>
				</thead>
				<tbody>
					{roster.map((player, index) => (
						<tr key={index} className="border-t border-red-100">
							<td className="px-4 py-2">
								{player.playerImage && (
									<img
										src={player.playerImage}
										alt={player.playerName}
										className="w-12 h-12 rounded-full border border-gray-300"
									/>
								)}
								{player.playerName}
							</td>

							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "atBats",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.atBats}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "hits",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.hits}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "runs",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.runs}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "rbis",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.rbis}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "homeRuns",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.homeRuns}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "outsPitched",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.outsPitched}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "runsAllowed",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.runsAllowed}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "strikeouts",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.strikeouts}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "walks",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.walks}
								/>
							</td>
							<td className="px-4 py-2 font-medium text-gray-800">
								<AdminNumberField
									onChange={(value) =>
										dispatch({
											type: "outs",
											payload: {
												value,
												playerId: player.playerId,
											},
										})
									}
									value={player.outs}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="pb-20" />
		</div>
	);
};

export default PlayGameTable;
