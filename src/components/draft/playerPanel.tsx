"use client";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { Button } from "../ui/button";
import PlayerCard from "../playerCard";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FullDraftPicks } from "@/dtos/draftDtos";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
	allPlayers: PlayerWithStatsDto[];
	currentDraftPick: FullDraftPicks | null;
	teamId: string;
};

type SortKey = "batting" | "pitching" | "fielding" | "running";

export default function PlayerPanel({
	allPlayers,
	currentDraftPick,
	teamId,
}: Props) {
	const [selectedPlayer, setSelectedPlayer] =
		useState<PlayerWithStatsDto | null>(null);
	const [showCard, setShowCard] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [sortKey, setSortKey] = useState<SortKey>("batting");
	const [ascending, setAscending] = useState(false);

	const teamsWithCaptains = new Set(
		allPlayers.filter((p) => p.isCaptain && p.teamId).map((p) => p.teamId),
	);

	const players = allPlayers.filter((p) => !p.teamId);

	const roster = allPlayers.filter((p) => p.teamId === teamId);

	const numCaptainsAvailable = players.filter((p) => p.isCaptain).length;

	const supabase = createClient();

	const handlePlayerClick = (player: PlayerWithStatsDto) => {
		setSelectedPlayer(player);
		setShowCard(true);
	};

	const handleSortChange = (key: SortKey) => {
		if (key === sortKey) {
			setAscending(!ascending);
		} else {
			setSortKey(key);
			setAscending(false);
		}
	};

	const handleDraftPick = async (
		playerId: string,
		draftPickId: string | null,
	) => {
		if (!draftPickId) {
			console.error("No active draft pick");
			return;
		}

		const { error } = await supabase.rpc("make_draft_pick", {
			p_selection_player_id: playerId,
			p_draft_pick_id: draftPickId,
		});

		if (error) {
			console.error("Error making draft pick:", error);
		}
	};

	const filteredAndSortedPlayers = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return players
			.filter((p) => p.name.toLowerCase().includes(query))
			.sort((a, b) => {
				const aVal = a[sortKey] ?? 0;
				const bVal = b[sortKey] ?? 0;
				return ascending ? aVal - bVal : bVal - aVal;
			});
	}, [players, searchQuery, sortKey, ascending]);

	return (
		<div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
			{/* MODAL */}
			{showCard && selectedPlayer && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="relative animate-in fade-in zoom-in-95">
						<PlayerCard player={selectedPlayer} />
						<button
							className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
							onClick={() => setShowCard(false)}
						>
							✕
						</button>
					</div>
				</div>
			)}

			{/* HEADER */}
			<div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
				<div className="p-4">
					<h2 className="text-xl font-bold tracking-tight text-gray-800">
						Draft Panel
					</h2>

					<div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
						<div className="text-[11px] uppercase tracking-wider text-gray-500">
							On the clock
						</div>
						<div className="text-sm font-semibold text-blue-700 mt-0.5">
							{currentDraftPick && (
								<div>
									<div className="flex flex-row items-center">
										{currentDraftPick.team.logo && (
											<img
												className="w-11 h-11 rounded-full"
												src={currentDraftPick.team.logo}
											/>
										)}
										<div>{currentDraftPick.team.name}</div>
									</div>
									<div>
										Round: {currentDraftPick.round} - Pick{" "}
										{currentDraftPick.pick}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div>
				<Tabs defaultValue="draft" className="mt-4 w-full">
					<TabsList className="w-full">
						<TabsTrigger className="rounded-xl" value="draft">
							Draft Board
						</TabsTrigger>
						<TabsTrigger className="rounded-xl" value="roster">
							Roster
						</TabsTrigger>
					</TabsList>
					<TabsContent value="draft">
						<div className="px-4 mt-4 pb-3 space-y-3">
							{/* SORT */}
							<div className="sticky flex gap-2 overflow-x-auto no-scrollbar">
								{(
									[
										"batting",
										"pitching",
										"fielding",
										"running",
									] as SortKey[]
								).map((key) => (
									<button
										key={key}
										onClick={() => handleSortChange(key)}
										className={`px-3 py-1.5 text-[11px] rounded-full border transition whitespace-nowrap font-medium ${
											sortKey === key
												? "bg-blue-600 text-white shadow"
												: "bg-white text-gray-600 hover:bg-gray-100"
										}`}
									>
										{key.toUpperCase()}
										{sortKey === key &&
											(ascending ? " ↑" : " ↓")}
									</button>
								))}
							</div>

							{/* SEARCH */}
							<div className="relative">
								<input
									type="text"
									className="w-full border rounded-xl p-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
									placeholder="Search players..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
								<span className="absolute left-3 top-2.5 text-gray-400">
									🔍
								</span>
							</div>
						</div>

						{/* LIST */}
						<div className="flex-1 overflow-y-auto p-3 space-y-3">
							{filteredAndSortedPlayers.map((player) => (
								<div
									key={player.id}
									onClick={() => handlePlayerClick(player)}
									className="group flex items-center justify-between gap-3 p-3 rounded-2xl border bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition cursor-pointer"
								>
									{/* LEFT */}
									<div className="flex items-center gap-3 min-w-0">
										{player.image && (
											<img
												src={player.image}
												alt={player.name}
												className="w-12 h-12 rounded-full border object-cover"
												style={{
													transform: "scaleX(-1)",
												}}
											/>
										)}

										<div className="min-w-0">
											<div className="flex flex-row gap-x-2 items-center">
												<div className="font-semibold text-gray-800 truncate group-hover:text-blue-700">
													{player.name}
												</div>
												{player.isCaptain && (
													<div className="text-[10px] font-bold">
														<Star className="w-4 h-4 text-yellow-300 fill-current inline-block mb-[1px]" />
													</div>
												)}
											</div>

											{/* STATS */}
											<div className="flex flex-wrap gap-1 mt-1">
												<Stat
													icon="/images/battingIcon.png"
													value={player.batting}
													active={
														sortKey === "batting"
													}
												/>
												<Stat
													icon="/images/pitchingIcon.png"
													value={player.pitching}
													active={
														sortKey === "pitching"
													}
												/>
												<Stat
													icon="/images/fieldingIcon.png"
													value={player.fielding}
													active={
														sortKey === "fielding"
													}
												/>
												<Stat
													icon="/images/runningIcon.png"
													value={player.running}
													active={
														sortKey === "running"
													}
												/>
											</div>
										</div>
									</div>

									{/* RIGHT ACTION */}
									<Button
										size="sm"
										className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg shadow-md opacity-90 group-hover:opacity-100 transition"
										disabled={
											!currentDraftPick ||
											currentDraftPick.teamId !==
												teamId ||
											(player.isCaptain &&
												teamsWithCaptains.has(teamId) &&
												numCaptainsAvailable <=
													8 - teamsWithCaptains.size)
										}
										onClick={async (e) => {
											e.stopPropagation();
											await handleDraftPick(
												player.id,
												currentDraftPick?.id || null,
											);
										}}
									>
										Draft
									</Button>
								</div>
							))}

							{/* EMPTY */}
							{filteredAndSortedPlayers.length === 0 && (
								<div className="text-center text-gray-500 mt-12">
									<div className="text-3xl mb-2">⚠️</div>
									No players found
								</div>
							)}
						</div>
					</TabsContent>
					<TabsContent value="roster">
						<div className="">
							<PlayerCards players={roster} />
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

function PlayerCards({ players }: { players: PlayerWithStatsDto[] }) {
	const [selectedPlayer, setSelectedPlayer] =
		useState<PlayerWithStatsDto | null>(null);
	const [showCard, setShowCard] = useState(false);

	const handlePlayerClick = (player: PlayerWithStatsDto) => {
		setSelectedPlayer(player);
		setShowCard(true);
	};

	return (
		<div className="flex-1 overflow-y-auto h-2/3 p-3 space-y-3">
			{showCard && selectedPlayer && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="relative animate-in fade-in zoom-in-95">
						<PlayerCard player={selectedPlayer} />
						<button
							className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
							onClick={() => setShowCard(false)}
						>
							✕
						</button>
					</div>
				</div>
			)}
			{players.map((player) => (
				<div
					key={player.id}
					onClick={() => handlePlayerClick(player)}
					className="group flex items-center justify-between gap-3 p-3 rounded-2xl border bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition cursor-pointer"
				>
					{/* LEFT */}
					<div className="flex items-center gap-3 min-w-0">
						{player.image && (
							<img
								src={player.image}
								alt={player.name}
								className="w-12 h-12 rounded-full border object-cover"
								style={{ transform: "scaleX(-1)" }}
							/>
						)}

						<div className="min-w-0">
							<div className="flex flex-row gap-x-2 items-center">
								<div className="font-semibold text-gray-800 truncate group-hover:text-blue-700">
									{player.name}
								</div>
								{player.isCaptain && (
									<div className="text-[10px] font-bold">
										<Star className="w-4 h-4 text-yellow-300 fill-current inline-block mb-[1px]" />
									</div>
								)}
							</div>

							{/* STATS */}
							<div className="flex flex-wrap gap-1 mt-1">
								<Stat
									icon="/images/battingIcon.png"
									value={player.batting}
									active={false}
								/>
								<Stat
									icon="/images/pitchingIcon.png"
									value={player.pitching}
									active={false}
								/>
								<Stat
									icon="/images/fieldingIcon.png"
									value={player.fielding}
									active={false}
								/>
								<Stat
									icon="/images/runningIcon.png"
									value={player.running}
									active={false}
								/>
							</div>
						</div>
					</div>

					{/* RIGHT ACTION */}
				</div>
			))}

			{/* EMPTY */}
			{players.length === 0 && (
				<div className="text-center text-gray-500 mt-12">
					<div className="text-3xl mb-2">⚠️</div>
					No players found
				</div>
			)}
		</div>
	);
}

/* ---------------- STAT BADGE ---------------- */
function Stat({
	icon,
	value,
	active,
}: {
	icon: string;
	value: number;
	active: boolean;
}) {
	return (
		<div
			className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border transition ${
				active
					? "bg-blue-100 text-blue-700 border-blue-200"
					: "bg-gray-50 text-gray-500 border-gray-200"
			}`}
		>
			<img src={icon} className="w-6 h-6" />
			<span>{value}</span>
		</div>
	);
}
