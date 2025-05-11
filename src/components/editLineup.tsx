"use client";
import React, { use, useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	TeamLineupDto,
	TeamRosterDto,
	TeamLineupPosition,
} from "@/dtos/teamDtos";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

import { Progress } from "@/components/ui/progress";
import { saveLineup } from "@/requests/lineup";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const positions = [
	{ key: "P", label: "Pitcher", top: "60%", left: "50%" },
	{ key: "C", label: "Catcher", top: "87%", left: "50%" },
	{ key: "1B", label: "1st Base", top: "58%", left: "78%" },
	{ key: "2B", label: "2nd Base", top: "40%", left: "68%" },
	{ key: "3B", label: "3rd Base", top: "58%", left: "20%" },
	{ key: "SS", label: "Shortstop", top: "40%", left: "30%" },
	{ key: "LF", label: "Left Field", top: "20%", left: "15%" },
	{ key: "CF", label: "Center Field", top: "10%", left: "50%" },
	{ key: "RF", label: "Right Field", top: "20%", left: "85%" },
] as const;

interface Props {
	lineupData: Promise<TeamLineupDto>;
	rosterData: Promise<TeamRosterDto>;
}

export default function EditLineup({ lineupData, rosterData }: Props) {
	const [selectedPlayers, setSelectedPlayers] = useState<
		Record<TeamLineupPosition, string | null>
	>({
		P: null,
		C: null,
		"1B": null,
		"2B": null,
		"3B": null,
		SS: null,
		LF: null,
		CF: null,
		RF: null,
	});
	const [hoveredPlayer, setHoveredPlayer] = useState<{
		playerId: string;
		top: string;
		left: string;
	} | null>(null);

	const { fieldingLineup } = use(lineupData);
	const { roster } = use(rosterData);

	useEffect(() => {
		if (fieldingLineup) {
			const updated = { ...selectedPlayers };
			for (const pos of positions) {
				updated[pos.key] = fieldingLineup[pos.key]?.id || null;
			}
			setSelectedPlayers(updated);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fieldingLineup]);

	const handleSelect = (posKey: TeamLineupPosition, playerId: string) => {
		setSelectedPlayers((prev) => ({
			...prev,
			[posKey]: playerId === "" ? null : playerId,
		}));
	};

	const clearLineup = () => {
		setSelectedPlayers({
			P: null,
			C: null,
			"1B": null,
			"2B": null,
			"3B": null,
			SS: null,
			LF: null,
			CF: null,
			RF: null,
		});
	};

	const handleSave = async () => {
		const supabase = createClient();
		const { data: user } = await supabase.auth.getUser();
		if (!user) {
			toast.error("You must be logged in to save a lineup");
			return;
		}

		const token = (await supabase.auth.getSession()).data.session
			?.access_token;
		if (!token) {
			toast.error("You must be logged in to save a lineup");
			return;
		}

		await saveLineup(selectedPlayers, token);
	};

	const { mutate, isPending } = useMutation({
		mutationFn: async () => await handleSave(),
		onSuccess: () => toast("Lineup saved successfully!"),
		onError: (error) => console.error("Error saving lineup:", error),
	});

	const getPlayerStats = (playerId: string) => {
		const player = roster.find((p) => p.id === playerId);
		if (!player) return null;
		const { batting, fielding, pitching, running } = player;

		return (
			<div className="bg-black text-white rounded-lg p-3 w-60 shadow-xl">
				<h3 className="font-bold mb-3 text-center">{player.name}</h3>
				<StatRow icon="/images/battingIcon.png" value={batting} />
				<StatRow icon="/images/fieldingIcon.png" value={fielding} />
				<StatRow icon="/images/pitchingIcon.png" value={pitching} />
				<StatRow icon="/images/runningIcon.png" value={running} />
			</div>
		);
	};

	const StatRow = ({ icon, value }: { icon: string; value: number }) => (
		<div className="flex items-center mb-2">
			<img src={icon} alt="Icon" className="w-5 h-5 mr-2" />
			<Progress value={value * 10} className="w-full h-2 rounded" />
			<span className="ml-2 text-sm">{value}</span>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-b bg-gray-100 px-6 py-6">
			<div className="flex flex-col md:flex-row items-start justify-center gap-10">
				<div className="relative">
					<img
						src="/images/field.png"
						alt="Field"
						width={700}
						height={500}
						className="rounded-xl shadow border border-gray-300"
					/>

					{/* Player Images on Field */}
					{positions.map((pos) => {
						const selectedId = selectedPlayers[pos.key];
						const player = roster.find((p) => p.id === selectedId);
						if (!player) return null;

						const playerImage =
							player.image || "/default-image.jpg";
						const isHovered = hoveredPlayer?.playerId === player.id;

						return (
							<div
								key={pos.key}
								className="absolute z-10"
								style={{
									top: pos.top,
									left: pos.left,
									transform: "translate(-50%, -50%)",
								}}
								onMouseEnter={() =>
									setHoveredPlayer({
										playerId: player.id,
										top: pos.top,
										left: pos.left,
									})
								}
								onMouseLeave={() => setHoveredPlayer(null)}
							>
								<div
									className={`w-12 h-12 rounded-full border-2 transition-transform duration-200 ${
										isHovered
											? "scale-125 border-yellow-400"
											: "border-white"
									}`}
								>
									<img
										src={playerImage}
										alt={player.name}
										className="w-full h-full rounded-full object-cover"
									/>
								</div>
							</div>
						);
					})}

					{/* Tooltip Hover */}
					{hoveredPlayer && (
						<div
							className="absolute z-50 transition-opacity duration-200"
							style={{
								top: hoveredPlayer.top,
								left: hoveredPlayer.left,
								transform: "translate(-50%, -130%)",
							}}
						>
							{getPlayerStats(hoveredPlayer.playerId)}
						</div>
					)}
				</div>

				{/* Lineup Selector Panel */}
				<div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 w-full max-w-sm">
					<h2 className="text-2xl font-bold text-violet-700 mb-4">
						Team Lineup
					</h2>
					{positions.map((pos) => {
						const selectedId = selectedPlayers[pos.key];
						const availablePlayers = roster.filter(
							(p) =>
								!Object.entries(selectedPlayers).some(
									([key, id]) =>
										id === p.id && key !== pos.key
								)
						);

						return (
							<div key={pos.key} className="mb-3">
								<label className="block mb-1 font-medium text-violet-800">
									{pos.label}
								</label>
								<Select
									value={selectedId ?? "none"}
									onValueChange={(value) =>
										handleSelect(
											pos.key,
											value === "none" ? "" : value
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select Player" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem
											value="none"
											className="text-gray-500"
										>
											Select Player
										</SelectItem>
										{availablePlayers.map((player) => (
											<SelectItem
												key={player.id}
												value={player.id}
											>
												{player.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						);
					})}

					<div className="mt-6 flex justify-between">
						<button
							onClick={() => mutate()}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
						>
							{isPending ? (
								<div className="flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Saving...
								</div>
							) : (
								<div>Save Lineup</div>
							)}
						</button>
						<button
							onClick={clearLineup}
							className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
						>
							Clear Lineup
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
