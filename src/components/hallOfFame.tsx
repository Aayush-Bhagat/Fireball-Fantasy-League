"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { PlayerWithAwards } from "@/app/hall-of-fame/page";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, ChevronDown } from "lucide-react";
import { TeamDto } from "@/dtos/teamDtos";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerCard from "./playerCard";

type Props = {
	playersWithAwards: PlayerWithAwards[];
};

export default function HallOfFame({ playersWithAwards }: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPlayer, setSelectedPlayer] =
		useState<PlayerWithStatsDto | null>(null);
	const [showCard, setShowCard] = useState(false);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [selectedAwardIds, setSelectedAwardIds] = useState<Set<string>>(
		new Set()
	);

	// Calculate max award count
	const maxPossibleAwards = useMemo(() => {
		const totals = playersWithAwards.map((p) =>
			p.awards.reduce((sum, award) => sum + award.wins.length, 0)
		);
		return totals.length > 0 ? Math.max(...totals) : 1;
	}, [playersWithAwards]);

	const [minAwardCount, setMinAwardCount] = useState(1);
	const [maxAwardCount, setMaxAwardCount] = useState(maxPossibleAwards);

	const handlePlayerClick = (player: PlayerWithStatsDto) => {
		setSelectedPlayer(player);
		setShowCard(true);
	};

	const toggleAwardFilter = (awardId: string) => {
		const newSelected = new Set(selectedAwardIds);
		if (newSelected.has(awardId)) {
			newSelected.delete(awardId);
		} else {
			newSelected.add(awardId);
		}
		setSelectedAwardIds(newSelected);
	};

	// Helper function to get teams a player was on when they won awards
	const getAwardTeams = (playerData: PlayerWithAwards): TeamDto[] => {
		const awardSeasons = new Set(
			playerData.awards.flatMap((award) =>
				award.wins.map((win) => win.seasonId)
			)
		);

		const teams = playerData.history
			.filter((h) => awardSeasons.has(h.seasonId))
			.map((h) => h.team);

		// Remove duplicates based on team ID
		const uniqueTeams = Array.from(
			new Map(teams.map((team) => [team.id, team])).values()
		);

		return uniqueTeams;
	};

	// Get all unique awards
	const allAwards = useMemo(() => {
		const awardsMap = new Map<
			string,
			{ id: string; name: string; icon: string | null }
		>();
		playersWithAwards.forEach((p) => {
			p.awards.forEach((award) => {
				if (!awardsMap.has(award.awardId)) {
					awardsMap.set(award.awardId, {
						id: award.awardId,
						name: award.name,
						icon: award.icon,
					});
				}
			});
		});
		return Array.from(awardsMap.values()).sort((a, b) =>
			a.name.localeCompare(b.name)
		);
	}, [playersWithAwards]);

	// Calculate total awards per player
	const playersWithTotalAwards = useMemo(() => {
		return playersWithAwards.map((p) => ({
			...p,
			totalAwards: p.awards.reduce(
				(sum, award) => sum + award.wins.length,
				0
			),
		}));
	}, [playersWithAwards]);

	// Filter players based on all criteria
	const filteredPlayers = useMemo(() => {
		let filtered = playersWithTotalAwards;

		// Filter by search term
		if (searchTerm) {
			const lowerSearch = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.player.name.toLowerCase().includes(lowerSearch) ||
					p.awards.some((award) =>
						award.name.toLowerCase().includes(lowerSearch)
					)
			);
		}

		// Filter by selected awards (OR logic - player has any of the selected awards)
		if (selectedAwardIds.size > 0) {
			filtered = filtered.filter((p) =>
				p.awards.some((award) => selectedAwardIds.has(award.awardId))
			);
		}

		// Filter by award count range
		filtered = filtered.filter(
			(p) =>
				p.totalAwards >= minAwardCount &&
				p.totalAwards <= maxAwardCount
		);

		return filtered;
	}, [
		playersWithTotalAwards,
		searchTerm,
		selectedAwardIds,
		minAwardCount,
		maxAwardCount,
	]);

	// Sort by total awards descending
	const sortedPlayers = useMemo(() => {
		return [...filteredPlayers].sort(
			(a, b) => b.totalAwards - a.totalAwards
		);
	}, [filteredPlayers]);

	return (
		<div className="container mx-auto px-4 pt-20 pb-8">
			{/* Player Modal */}
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

			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<Trophy className="w-8 h-8 text-yellow-500" />
					<h1 className="text-4xl font-bold">Hall of Fame</h1>
				</div>
				<p className="text-gray-600">
					Celebrating the league&apos;s most{" "}
					<button
						onClick={() => {
							const redPianta = playersWithAwards.find(
								(p) => p.player.id === "01969260-eab9-76cb-95e6-1889b0eaf4a9"
							);
							if (redPianta) {
								handlePlayerClick(redPianta.player);
							}
						}}
						className="cursor-pointer"
					>
						decorated players
					</button>
				</p>
			</div>

			{/* Filters */}
			<Card className="mb-6 pb-0">
				{/* Search - Always Visible */}
				<div className="px-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							type="text"
							placeholder="Search by player name or award..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<CardHeader
					className={`cursor-pointer hover:bg-gray-50 transition-all ${filtersExpanded ? "pb-6" : "pb-0"
						}`}
					onClick={() => setFiltersExpanded(!filtersExpanded)}
				>
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Filters</CardTitle>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-300 ${filtersExpanded ? "rotate-180" : ""
								}`}
						/>
					</div>
				</CardHeader>
				<div
					className={`overflow-hidden transition-all duration-300 ease-in-out ${filtersExpanded
						? "max-h-[1000px] opacity-100"
						: "max-h-0 opacity-0"
						}`}
				>
					<CardContent className="space-y-6 pb-8">
						{/* Award Filter Buttons */}
						<div>
							<h3 className="text-sm font-semibold mb-3 text-gray-700">
								Filter by Award Type
							</h3>
							<div className="flex flex-wrap gap-2">
								{allAwards.map((award) => (
									<button
										key={award.id}
										onClick={() => toggleAwardFilter(award.id)}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${selectedAwardIds.has(award.id)
											? "bg-indigo-600 text-white border-indigo-600 shadow-md"
											: "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
											}`}
									>
										{award.icon && (
											<Image
												src={award.icon}
												alt={award.name}
												width={20}
												height={20}
												className="object-contain"
												unoptimized
											/>
										)}
										<span className="text-sm font-medium">
											{award.name}
										</span>
									</button>
								))}
							</div>
							{selectedAwardIds.size > 0 && (
								<button
									onClick={() => setSelectedAwardIds(new Set())}
									className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 underline"
								>
									Clear award filters
								</button>
							)}
						</div>

						{/* Award Count Slider */}
						<div>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold text-gray-700">
									Total Awards Per Player
								</h3>
								<span className="text-sm font-medium text-gray-600">
									{minAwardCount} - {maxAwardCount}
								</span>
							</div>
							<div className="space-y-4">
								<div>
									<label className="text-xs text-gray-600 mb-1 block">
										Minimum: {minAwardCount}
									</label>
									<input
										type="range"
										min="1"
										max={maxPossibleAwards}
										value={minAwardCount}
										onChange={(e) => {
											const val = parseInt(e.target.value);
											setMinAwardCount(val);
											if (val > maxAwardCount) {
												setMaxAwardCount(val);
											}
										}}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
									/>
								</div>
								<div>
									<label className="text-xs text-gray-600 mb-1 block">
										Maximum: {maxAwardCount}
									</label>
									<input
										type="range"
										min="1"
										max={maxPossibleAwards}
										value={maxAwardCount}
										onChange={(e) => {
											const val = parseInt(e.target.value);
											setMaxAwardCount(val);
											if (val < minAwardCount) {
												setMinAwardCount(val);
											}
										}}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
									/>
								</div>
							</div>
							{(minAwardCount > 1 ||
								maxAwardCount < maxPossibleAwards) && (
									<button
										onClick={() => {
											setMinAwardCount(1);
											setMaxAwardCount(maxPossibleAwards);
										}}
										className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 underline"
									>
										Reset award count filter
									</button>
								)}
						</div>
					</CardContent>
				</div>
			</Card>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">
							Total Award Winners
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{playersWithAwards.length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">
							Total Awards Given
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{playersWithAwards.reduce(
								(sum, p) =>
									sum +
									p.awards.reduce(
										(aSum, a) => aSum + a.wins.length,
										0
									),
								0
							)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">
							Unique Awards
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{
								new Set(
									playersWithAwards.flatMap((p) =>
										p.awards.map((a) => a.awardId)
									)
								).size
							}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Players Grid */}
			{sortedPlayers.length === 0 ? (
				<div className="text-center py-12 text-gray-500">
					<p className="text-lg font-medium mb-2">
						No players found
					</p>
					<p className="text-sm">
						Try adjusting your filters or search criteria
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{sortedPlayers.map((playerData, index) => (
						<Card
							key={playerData.player.id}
							className="hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => handlePlayerClick(playerData.player)}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										{playerData.player.image && (
											<Image
												src={playerData.player.image}
												alt={playerData.player.name}
												width={64}
												height={64}
												className="rounded-full object-cover border-2 border-gray-200"
												unoptimized
											/>
										)}
										<div>
											<CardTitle className="text-xl">
												{playerData.player.name === "Fire Bro"
													? "Fire Bron"
													: playerData.player.name}
											</CardTitle>
											<p className="text-sm text-gray-600">
												{getAwardTeams(playerData).length > 0
													? getAwardTeams(playerData)
														.map((t) => t.name)
														.join(", ")
													: playerData.player.team?.name ||
													"Free Agent"}
											</p>
										</div>
									</div>
									<Badge
										variant="secondary"
										className="text-lg px-3 py-1"
									>
										{playerData.totalAwards}{" "}
										<Trophy className="w-4 h-4 ml-1 inline" />
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{playerData.awards.map((award) => (
										<div
											key={award.awardId}
											className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
										>
											{award.icon && (
												<Image
													src={award.icon}
													alt={award.name}
													width={48}
													height={48}
													className="object-contain rounded"
													unoptimized
												/>
											)}
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2 mb-1">
													<h4 className="font-semibold text-sm truncate">
														{award.name}
													</h4>
													<Badge variant="outline">
														x{award.wins.length}
													</Badge>
												</div>
												<p className="text-xs text-gray-600 mb-2">
													{award.description}
												</p>
												<div className="flex flex-wrap gap-1">
													{award.wins.map((win) => (
														<span
															key={win.seasonId}
															className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
														>
															Season {win.seasonId}
														</span>
													))}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
