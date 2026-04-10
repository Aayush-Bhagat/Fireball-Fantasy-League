"use client";
import React, { useEffect, useState } from "react";
import PlayerPanel from "./playerPanel";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { DraftDto, FullDraftPicks } from "@/dtos/draftDtos";
import { createClient } from "@/lib/supabase/client";

type Props = {
	players: PlayerWithStatsDto[];
	draftData: DraftDto;
	teamId: string;
};

// ---------------- HELPERS ----------------
const formatPick = (p: FullDraftPicks) => `${p.round}.${p.pick}`;

// ---------------- COMPONENTS ----------------

function PickCard({
	pick,
	currentPick,
}: {
	pick: FullDraftPicks;
	currentPick: FullDraftPicks | null;
}) {
	const isActive = !pick.playerSelected;

	return (
		<div
			className={`rounded-xl p-3 text-xs border min-h-[80px] flex flex-col justify-between transition-all
        ${isActive ? "bg-blue-50" : "border-gray-200 bg-white"} ${currentPick?.id === pick.id ? "ring-2 ring-blue-400" : ""}`}
		>
			{/* top row */}
			<div className="flex justify-between items-start">
				<div className="flex flex-col">
					<span className="font-semibold text-gray-700">
						{formatPick(pick)}
					</span>
					{pick.isCompensatory && (
						<span className="text-[10px] font-light">
							Comp Pick
						</span>
					)}
				</div>

				<div className="flex gap-1">
					{currentPick?.id === pick.id && (
						<span className="text-[10px] bg-red-500 text-white px-2 py-[2px] rounded-full shadow">
							OTC
						</span>
					)}
					{pick.playerSelected && (
						<span className="text-[10px] bg-green-500 text-white px-2 py-[2px] rounded-full shadow">
							✓
						</span>
					)}
				</div>
			</div>
			{/* player section */}
			{pick.playerSelected && (
				<div className="flex items-center gap-2 mt-2">
					{pick.playerSelected.image && (
						<img
							src={pick.playerSelected.image}
							alt={pick.playerSelected.name}
							className="w-10 h-10 rounded-lg object-cover border shadow-sm"
						/>
					)}

					<div className="flex flex-col overflow-hidden">
						<span className="text-sm font-semibold text-gray-800 truncate">
							{pick.playerSelected.name}
						</span>
						<span className="text-[11px] text-gray-500">
							Drafted
						</span>
					</div>
				</div>
			)}
			{currentPick?.id === pick.id && !pick.playerSelected && (
				<div className="text-gray-400 text-[11px] mt-2">
					Waiting for pick...
				</div>
			)}
			{pick.teamId !== pick.originalTeamId && (
				<div className="mt-2 flex items-center gap-1 text-[10px] text-gray-600">
					{/* current team */}
					{pick.team.logo && (
						<img
							src={pick.team.logo}
							className="w-5 h-5 rounded-full"
						/>
					)}

					<span className="text-gray-400">via</span>

					{/* original team */}
					{pick.originalTeam.logo && (
						<img
							src={pick.originalTeam.logo}
							className="w-5 h-5 rounded-full"
						/>
					)}
				</div>
			)}
		</div>
	);
}

function TeamColumn({
	picks,
	isComp = false,
	currentPick,
}: {
	picks: FullDraftPicks[];
	isComp?: boolean;
	currentPick: FullDraftPicks | null;
}) {
	if (picks.length === 0) {
		return (
			<div
				className={
					isComp
						? "min-h-[70px]"
						: "min-h-[110px] flex items-center justify-center text-gray-300 text-xs"
				}
			></div>
		);
	}

	return (
		<div className="space-y-2">
			{picks.map((p, i) => (
				<PickCard key={i} pick={p} currentPick={currentPick} />
			))}
		</div>
	);
}

// ---------------- MAIN ----------------
export default function DraftBoard({ players, draftData, teamId }: Props) {
	const [draft, setDraft] = useState(draftData);
	const [draftPicks, setDraftPicks] = useState(draftData.draftPicks);
	const draftOrder = draftData.draftOrder;
	const [allPlayers, setAllPlayers] = useState(players);

	const supabase = createClient();

	const findCurrentPick = (pickId: string | null) => {
		for (const round of draftPicks) {
			for (const pick of round.picks) {
				if (pick.id === pickId) {
					return pick;
				}
			}
		}
		return null;
	};

	const currentPick = findCurrentPick(draft.currentPickId);

	useEffect(() => {
		console.log(allPlayers);
	}, [allPlayers]);

	useEffect(() => {
		console.log(draft);
	}, [draft]);

	useEffect(() => {
		console.log(draftPicks);
	}, [draftPicks]);

	useEffect(() => {
		const channel = supabase
			.channel("draft:" + draft.id)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "draft",
				},

				(payload) => {
					const newDraft = payload.new as {
						id: string;
						status: "not_started" | "in_progress" | "completed";
						current_pick_id: string | null;
					};
					console.log(newDraft);
					setDraft((prev) => {
						return {
							...prev,
							status: newDraft.status,
							currentPickId: newDraft.current_pick_id,
						};
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "draft_picks",
				},

				(payload) => {
					const newPick = payload.new as {
						id: string;
						selection: string | null;
					};
					console.log(newPick);
					const player = players.find(
						(p) => p.id === newPick.selection,
					);

					setDraftPicks((prev) => {
						return prev.map((round) => {
							return {
								...round,
								picks: round.picks.map((pick) =>
									pick.id === newPick.id
										? {
												...pick,
												selection: newPick.selection,
												playerSelected: player || null,
											}
										: pick,
								),
							};
						});
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "players",
				},

				(payload) => {
					const updatedPlayer = payload.new as {
						id: string;
						team_id: string | null;
					};
					console.log(updatedPlayer);
					setAllPlayers((prev) => {
						return prev.map((p) =>
							p.id === updatedPlayer.id
								? { ...p, teamId: updatedPlayer.team_id }
								: p,
						);
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [draft.id, supabase]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col lg:flex-row">
			{/* LEFT */}
			<div className="flex-1 p-4 lg:p-8">
				<div className="mb-6 text-center">
					<h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800">
						Fireball League Draft
					</h1>
					<p className="text-sm text-gray-500">Season 4</p>
				</div>

				<div className="overflow-x-auto rounded-2xl border bg-white shadow-lg">
					<div className="min-w-[950px] p-4">
						{/* HEADER */}
						<div className="grid grid-cols-8 gap-3 sticky top-0 bg-white/80 backdrop-blur border-b pb-3">
							{draftOrder.map((t) => (
								<div key={t.teamId} className="text-center">
									{t.team.logo && (
										<img
											src={t.team.logo}
											alt={t.team.name}
											className="w-14 h-14 mx-auto mb-1 rounded-full"
										/>
									)}
									<div className="text-xs font-semibold text-gray-700">
										{t.team.name}
									</div>
								</div>
							))}
						</div>

						{/* ROUNDS */}
						<div className="space-y-5 mt-4">
							{draftPicks.map((round) => {
								const normal = round.picks.filter(
									(p) => p.isCompensatory === false,
								);
								const comp = round.picks.filter(
									(p) => p.isCompensatory === true,
								);

								return (
									<div
										key={round.round}
										className="rounded-xl border bg-gray-50 p-3"
									>
										<div className="mb-2 font-semibold text-gray-700">
											Round {round.round}
										</div>

										{/* NORMAL */}
										<div className="grid grid-cols-8 gap-3">
											{draftOrder.map((t) => (
												<TeamColumn
													key={t.teamId}
													picks={normal.filter(
														(p) =>
															p.originalTeamId ===
															t.teamId,
													)}
													currentPick={currentPick}
												/>
											))}
										</div>

										{/* COMP */}
										{comp.length > 0 && (
											<>
												<div className="text-[11px] text-yellow-700 font-semibold mt-3 mb-1">
													Compensatory Picks
												</div>

												<div className="grid grid-cols-8 gap-3">
													{draftOrder.map((t) => (
														<TeamColumn
															key={t.teamId}
															picks={comp.filter(
																(p) =>
																	p.teamId ===
																	t.teamId,
															)}
															isComp
															currentPick={
																currentPick
															}
														/>
													))}
												</div>
											</>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* RIGHT PANEL */}
			<div className="w-full lg:w-[520px] border-t lg:border-l bg-white shadow-xl">
				<div className="sticky top-0 p-4 border-b bg-white/80 backdrop-blur">
					<h2 className="text-lg font-bold">Player Board</h2>
					<p className="text-xs text-gray-500">
						Free agents & available players
					</p>
				</div>

				<div className="p-3">
					<PlayerPanel
						allPlayers={allPlayers}
						currentDraftPick={currentPick}
						teamId={teamId}
					/>
				</div>
			</div>
		</div>
	);
}
