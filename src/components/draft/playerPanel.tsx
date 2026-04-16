"use client";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { Button } from "../ui/button";
import PlayerCard from "../playerCard";
import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FullDraftPicks } from "@/dtos/draftDtos";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Props = {
	allPlayers: PlayerWithStatsDto[];
	currentDraftPick: FullDraftPicks | null;
	teamId: string;
	draftPicks: {
		round: number;
		picks: FullDraftPicks[];
	}[];
};

type SortKey = "batting" | "pitching" | "fielding" | "running";

export default function PlayerPanel({
	allPlayers,
	currentDraftPick,
	teamId,
	draftPicks,
}: Props) {
	const [selectedPlayer, setSelectedPlayer] =
		useState<PlayerWithStatsDto | null>(null);
	const [showCard, setShowCard] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [sortKey, setSortKey] = useState<SortKey>("batting");
	const [ascending, setAscending] = useState(false);

	// ✅ TIMER STATE
	const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

	const teamsWithCaptains = new Set(
		allPlayers.filter((p) => p.isCaptain && p.teamId).map((p) => p.teamId),
	);

	const players = allPlayers.filter((p) => !p.teamId);
	const roster = allPlayers.filter((p) => p.teamId === teamId);
	const numCaptainsAvailable = players.filter((p) => p.isCaptain).length;
	const canDraft = currentDraftPick && currentDraftPick.teamId === teamId;

	const supabase = createClient();

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	useEffect(() => {
		if (currentDraftPick?.id) {
			setTimeLeft(120);
		}
	}, [currentDraftPick?.id]);

	useEffect(() => {
		if (!currentDraftPick) return;
		if (timeLeft <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLeft, currentDraftPick]);

	const handlePlayerClick = (player: PlayerWithStatsDto) => {
		setSelectedPlayer(player);
		setShowCard(true);
	};

	const myRemainingPicks = useMemo(() => {
		return draftPicks
			.flatMap((r) => r.picks)
			.filter((p) => p.teamId === teamId && !p.selection); // unpicked picks for your team
	}, [draftPicks, teamId]);

	const myRemainingRounds = [
		...new Set(myRemainingPicks.map((p) => `${p.round}.${p.pick}`)),
	].sort();

	const handleSortChange = (key: SortKey) => {
		if (key === sortKey) {
			setAscending(!ascending);
		} else {
			setSortKey(key);
			setAscending(false);
		}
	};

	const handleDraftPick = useMutation({
		mutationFn: async ({
			playerId,
			draftPickId,
		}: {
			playerId: string;
			draftPickId: string | null;
		}) => {
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
		},
	});

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
		<div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col min-h-0">
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
			<div className="sticky top-0 z-20 backdrop-blur-md rounded-xl bg-white/80 shadow-sm border border-gray-100 p-4 space-y-3">
				{/* TOP ROW — Live label + Timer ring */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium uppercase tracking-widest">
						<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
						Live Draft
					</div>

					{/* TIMER RING */}
				</div>

				{/* PICK CARD */}
				{currentDraftPick && (
					<div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
						{currentDraftPick.team.logo ? (
							<img
								src={currentDraftPick.team.logo}
								className="w-12 h-12 rounded-full border-2 border-gray-100 object-cover flex-shrink-0"
							/>
						) : (
							<div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-xl">
								⚾
							</div>
						)}

						<div className="flex-1 min-w-0">
							<div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
								On the clock
							</div>
							<div className="text-base font-medium text-gray-800 truncate">
								{currentDraftPick.team.name}
							</div>
							<div className="text-[11px] text-gray-400 mt-0.5">
								Round {currentDraftPick.round} · Pick{" "}
								{currentDraftPick.pick}
							</div>
						</div>
						<div className="flex flex-row gap-x-2">
							<div className="relative w-16 h-16">
								<svg
									className="absolute inset-0 -rotate-90"
									width="64"
									height="64"
									viewBox="0 0 64 64"
								>
									<circle
										cx="32"
										cy="32"
										r="26"
										fill="none"
										stroke="#e5e7eb"
										strokeWidth="4"
									/>
									<circle
										cx="32"
										cy="32"
										r="26"
										fill="none"
										strokeWidth="4"
										strokeLinecap="round"
										stroke={
											timeLeft <= 10
												? "#E24B4A"
												: timeLeft <= 30
													? "#EF9F27"
													: "#378ADD"
										}
										strokeDasharray={`${2 * Math.PI * 26}`}
										strokeDashoffset={`${2 * Math.PI * 26 * (1 - timeLeft / 120)}`}
										className="transition-all duration-1000"
									/>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span
										className={`text-sm font-medium leading-none ${timeLeft <= 10 ? "text-red-500" : "text-gray-800"}`}
									>
										{formatTime(timeLeft)}
									</span>
									<span className="text-[8px] text-gray-400 uppercase tracking-wide mt-0.5">
										left
									</span>
								</div>
							</div>
							<div className="flex-shrink-0 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-center">
								<div className="text-2xl font-medium text-blue-500 leading-none">
									#{currentDraftPick.pick}
								</div>
								<div className="text-[9px] uppercase tracking-widest text-blue-400 mt-0.5">
									Pick
								</div>
							</div>
						</div>
					</div>
				)}

				{/* PICKS REMAINING */}
				<div className="flex pl-2 gap-6 text-sm text-gray-400">
					<span>
						Picks Left:{" "}
						<span className="text-blue-400 font-semibold">
							{myRemainingPicks.length}
						</span>
					</span>
					<span>
						Next:{" "}
						<span className="text-blue-400">
							{myRemainingRounds[0] || "—"}
						</span>
					</span>
				</div>
			</div>

			<div className="flex flex-col flex-1 min-h-0 pt-6">
				<Tabs
					defaultValue="draft"
					className="flex flex-col flex-1 gap-y-2 min-h-0"
				>
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
													<Star className="w-4 h-4 text-yellow-300 fill-current" />
												)}
											</div>

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

									{canDraft && (
										<Button
											size="sm"
											className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg shadow-md opacity-90 group-hover:opacity-100 transition cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
											disabled={
												handleDraftPick.isPending ||
												(player.isCaptain &&
													teamsWithCaptains.has(
														teamId,
													) &&
													numCaptainsAvailable <=
														8 -
															teamsWithCaptains.size)
											}
											onClick={async (e) => {
												e.stopPropagation();
												await handleDraftPick.mutateAsync(
													{
														playerId: player.id,
														draftPickId:
															currentDraftPick?.id ||
															null,
													},
												);
											}}
										>
											{handleDraftPick.isPending &&
											handleDraftPick.variables
												?.playerId === player.id ? (
												<>
													<span className="animate-spin">
														<Loader2 className="w-4 h-4" />
													</span>
													Drafting...
												</>
											) : (
												"Draft"
											)}
										</Button>
									)}
								</div>
							))}

							{filteredAndSortedPlayers.length === 0 && (
								<div className="text-center text-gray-500 mt-12">
									<div className="text-3xl mb-2">⚠️</div>
									No players found
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="roster">
						<PlayerCards players={roster} />
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
