"use client";
import React, { useEffect, useRef, useState } from "react";
import PlayerPanel from "./playerPanel";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { DraftDto } from "@/dtos/draftDtos";
import { createClient } from "@/lib/supabase/client";
import DraftLobby from "./DraftLobby";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { completeDraftRequest } from "@/requests/draft";
import { Loader2 } from "lucide-react";
import PickToast, { ToastPick } from "@/components/draft/PickToast";
import { TeamColumn } from "./TeamPickColumn";

type Props = {
	players: PlayerWithStatsDto[];
	draftData: DraftDto;
	teamId: string;
	userId: string;
};

// ---------------- MAIN ----------------
export default function DraftBoard({
	players,
	draftData,
	teamId,
	userId,
}: Props) {
	const [draft, setDraft] = useState(draftData);
	const [draftPicks, setDraftPicks] = useState(draftData.draftPicks);
	const draftOrder = draftData.draftOrder;
	const [allPlayers, setAllPlayers] = useState(players);

	// Toast state
	const [lastPickToast, setLastPickToast] = useState<ToastPick | null>(null);
	const [toastVisible, setToastVisible] = useState(false);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	const showPickToast = (toast: ToastPick) => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		setLastPickToast(toast);
		setToastVisible(true);
		toastTimerRef.current = setTimeout(() => {
			setToastVisible(false);
		}, 3500);
	};

	const handleCompleteDraft = useMutation({
		mutationFn: async () => {
			const session = await supabase.auth.getSession();
			const token = session.data.session?.access_token;
			if (!token) return;
			await completeDraftRequest(draftData.id, token);
		},
	});

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
					setDraft((prev) => ({
						...prev,
						status: newDraft.status,
						currentPickId: newDraft.current_pick_id,
					}));
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
						team_id: string | null;
						round: number;
						pick: number;
					};
					const player = players.find(
						(p) => p.id === newPick.selection,
					);

					if (newPick.selection && player) {
						const pickTeam = draftOrder.find(
							(t) => t.teamId === newPick.team_id,
						);
						showPickToast({
							playerName: player.name,
							teamName: pickTeam?.team.name ?? "Unknown",
							teamLogo: pickTeam?.team.logo,
							round: newPick.round,
							pick: newPick.pick,
						});
					}

					setDraftPicks((prev) =>
						prev.map((round) => ({
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
						})),
					);
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
					setAllPlayers((prev) =>
						prev.map((p) =>
							p.id === updatedPlayer.id
								? { ...p, teamId: updatedPlayer.team_id }
								: p,
						),
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [draft.id, supabase, players, draftOrder]);

	if (draft.status === "not_started") {
		return <DraftLobby userId={userId} teamId={teamId} draft={draftData} />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col lg:flex-row">
			{/* LEFT */}
			<div className="flex-1 p-4 lg:p-8">
				<div className="mb-6 text-center">
					<div className="flex justify-center items-center">
						{draft.status === "completed" &&
							draft.commissionerId === userId && (
								<Button
									disabled={handleCompleteDraft.isPending}
									onClick={() => handleCompleteDraft.mutate()}
									className="bg-blue-600 hover:bg-blue-700 rounded-md p-3 text-white mt-2 flex items-center justify-center gap-2"
								>
									{handleCompleteDraft.isPending && (
										<Loader2 className="h-4 w-4 animate-spin" />
									)}
									{handleCompleteDraft.isPending
										? "Completing..."
										: "Complete"}
								</Button>
							)}
					</div>
				</div>

				<div className="overflow-auto max-h-[65vh] lg:max-h-[80vh] rounded-2xl border bg-white shadow-lg">
					<div className="min-w-[950px] p-4">
						{/* HEADER */}
						<div className="grid grid-cols-8 gap-3 top-0 sticky z-20 bg-white/80 backdrop-blur border-b pb-3">
							{draftOrder.map((t) => {
								const isOnTheClock =
									currentPick?.teamId === t.teamId &&
									draft.status === "in_progress";

								return (
									<div
										key={t.teamId}
										className={`text-center rounded-xl p-2 transition-all duration-300 relative ${
											isOnTheClock
												? "bg-green-50 ring-2 ring-green-400"
												: ""
										}`}
									>
										{/* On the clock badge */}
										{isOnTheClock && (
											<div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-500 text-white text-[9px] font-semibold px-2 py-[2px] rounded-full whitespace-nowrap shadow">
												<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
												ON THE CLOCK
											</div>
										)}

										{t.team.logo && (
											<img
												src={t.team.logo}
												alt={t.team.name}
												className={`w-14 h-14 mx-auto mb-1 rounded-full transition-all duration-300 ${
													isOnTheClock
														? "ring-2 ring-green-400 shadow-md"
														: ""
												}`}
											/>
										)}
										<div
											className={`text-xs font-semibold transition-colors duration-300 ${
												isOnTheClock
													? "text-green-700"
													: "text-gray-700"
											}`}
										>
											{t.team.name}
										</div>
									</div>
								);
							})}
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
			{draft.status === "in_progress" && (
				<div className="w-full lg:w-[clamp(320px,25vw,480px)] border-t lg:border-l bg-white shadow-xl">
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
							draftPicks={draftPicks}
						/>
					</div>
				</div>
			)}

			{/* PICK TOAST */}
			<PickToast toast={lastPickToast} visible={toastVisible} />
		</div>
	);
}
