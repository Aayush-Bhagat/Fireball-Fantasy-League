/* eslint-disable */
// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { DraftDto } from "@/dtos/draftDtos";
import { useMutation } from "@tanstack/react-query";
import { startDraftRequest } from "@/requests/draft";
import { Loader2 } from "lucide-react";

const supabase = createClient();

type Props = {
	userId: string;
	teamId: string;
	draft: DraftDto;
};

export default function DraftLobby({ userId, teamId, draft }: Props) {
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [teams, setTeams] = useState<string[]>([]);
	const [joined, setJoined] = useState(false);

	const teamsInLobby = draft.draftOrder.filter((order) =>
		teams.includes(order.teamId),
	);

	const handleStartDraft = useMutation({
		mutationFn: async () => {
			const session = await supabase.auth.getSession();

			const token = session.data.session?.access_token;

			if (!token) {
				throw new Error("Not Logged In");
			}

			await startDraftRequest(draft.id, token);
		},
	});

	useEffect(() => {
		let cancelled = false;
		const setupChannel = async () => {
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}

			await supabase.realtime.setAuth();

			const ch = supabase.channel(`draft-presence:${draft.id}`, {
				config: {
					presence: { key: String(userId), enabled: true },
					private: true,
				},
			});

			channelRef.current = ch;

			channelRef.current.on("presence", { event: "sync" }, () => {
				console.log(channelRef.current?.presenceState());

				const state = channelRef.current?.presenceState();
				const joinedTeams = Object.values(state).map(
					(item) => item[0].teamId,
				);

				setTeams(joinedTeams);
			});

			channelRef.current.subscribe(async (status) => {
				if (status !== "SUBSCRIBED" || cancelled) return;

				try {
					await ch.track({
						userId,
						teamId,
						joinedAt: new Date().toISOString(),
					});
					setJoined(true);
				} catch (e) {}
			});
		};

		setupChannel();

		return () => {
			cancelled = true;
			channelRef.current?.untrack();
			channelRef.current?.unsubscribe();
			channelRef.current = null;
		};
	}, []);

	const renderTeams = () => {
		const slots = draft.draftOrder.length;

		return (
			<div className="flex flex-col gap-2">
				{teamsInLobby.map((t, i) => {
					const isMe = t.team.userId === userId;
					return (
						<div
							key={i}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
								isMe
									? "bg-blue-50 border-blue-200"
									: "bg-gray-50 border-gray-200"
							}`}
						>
							{t.team.logo ? (
								<img
									src={t.team.logo}
									alt={t.team.name}
									className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
									onError={(e) =>
										(e.currentTarget.style.display = "none")
									}
								/>
							) : (
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
										isMe
											? "bg-blue-100 text-blue-600"
											: "bg-blue-50 text-blue-600"
									}`}
								>
									{t.team.name.slice(0, 2).toUpperCase()}
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{t.team.name}
								</p>
								{isMe && (
									<p className="text-xs text-blue-400">You</p>
								)}
							</div>
							<span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
								Ready
							</span>
						</div>
					);
				})}

				{/* Empty slots */}
				{Array.from({ length: slots - teamsInLobby.length }).map(
					(_, i) => (
						<div
							key={`empty-${i}`}
							className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-200 opacity-50"
						>
							<div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
							<div>
								<p className="text-sm text-gray-400">
									Waiting for team...
								</p>
								<p className="text-xs text-gray-300">
									Slot {teamsInLobby.length + i + 1} of{" "}
									{slots}
								</p>
							</div>
						</div>
					),
				)}
			</div>
		);
	};

	return (
		<div className="absolute inset-0 flex items-center justify-center p-6">
			<div className="w-full max-w-xl space-y-4">
				<div className="rounded-2xl shadow-sm border border-gray-200 bg-white overflow-hidden">
					{/* Header */}
					<div className="px-6 pt-6 pb-4 border-b border-gray-100">
						<h2 className="text-lg font-medium text-center">
							Draft Lobby
						</h2>
						<div className="flex justify-center mt-2">
							<span
								className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
									joined
										? "bg-green-50 text-green-700"
										: "bg-gray-100 text-gray-500"
								}`}
							>
								<span
									className={`w-1.5 h-1.5 rounded-full ${joined ? "bg-green-500" : "bg-gray-400"}`}
								/>
								{joined ? "Connected" : "Joining lobby..."}
							</span>
						</div>
					</div>

					{/* Team list */}
					<div className="px-6 py-4">
						<p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
							Teams in lobby
						</p>
						{renderTeams()}
					</div>

					{/* Footer */}
					<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
						<p className="text-xs text-gray-400">
							<span className="font-medium text-gray-700">
								{teamsInLobby.length}
							</span>{" "}
							/ {draft.draftOrder.length} teams joined
						</p>
						{draft.commissionerId === userId && (
							<button
								disabled={
									handleStartDraft.isPending
									// teamsInLobby.length <
									// 	draft.draftOrder.length
								}
								onClick={() => handleStartDraft.mutate()}
								className="text-sm px-4 py-1.5 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{handleStartDraft.isPending && (
									<Loader2 className="w-3 h-3 animate-spin" />
								)}
								Start draft
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
