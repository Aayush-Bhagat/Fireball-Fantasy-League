"use client";

import React from "react";
import {
	getTeamTrades,
	acceptTrade,
	declineTrade,
	cancelTrade,
} from "@/requests/trade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { PlusCircle, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "../ui/StatusBadge";
import { TradeCardSkeleton } from "@/components/loaders/TeamTradesSkeleton";

const statusMap: Record<string, "complete" | "pending" | "incomplete"> = {
	Accepted: "complete",
	Pending: "pending",
	Declined: "incomplete",
	Canceled: "incomplete",
	Countered: "pending",
};

export default function ViewTeamTrades() {
	const queryClient = useQueryClient();
	const { data: tradeDetails, isLoading } = useQuery({
		queryKey: ["tradeDetails"],
		queryFn: async () => {
			const supabase = createClient();
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				toast.error("You must be logged in to view trades");
				return;
			}

			const token = (await supabase.auth.getSession()).data.session
				?.access_token;
			if (!token) {
				toast.error("You must be logged in to view trades");
				return;
			}

			return await getTeamTrades(token);
		},
	});

	const handleAcceptTrade = useMutation({
		mutationFn: async (tradeId: string) => {
			const supabase = createClient();
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				toast.error("You must be logged in to accept trades");
				return;
			}

			const token = (await supabase.auth.getSession()).data.session
				?.access_token;
			if (!token) {
				toast.error("You must be logged in to accept trades");
				return;
			}
			await acceptTrade(token, tradeId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tradeDetails"] });
			toast.success("Trade accepted successfully!");
		},
	});

	const handleDeclineTrade = useMutation({
		mutationFn: async (tradeId: string) => {
			const supabase = createClient();
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				toast.error("You must be logged in to decline trades");
				return;
			}

			const token = (await supabase.auth.getSession()).data.session
				?.access_token;
			if (!token) {
				toast.error("You must be logged in to decline trades");
				return;
			}
			await declineTrade(token, tradeId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tradeDetails"] });
			toast.success("Trade declined successfully!");
		},
	});

	const handleCancelTrade = useMutation({
		mutationFn: async (tradeId: string) => {
			const supabase = createClient();
			const { data: user } = await supabase.auth.getUser();
			if (!user) {
				toast.error("You must be logged in to cancel trades");
				return;
			}

			const token = (await supabase.auth.getSession()).data.session
				?.access_token;
			if (!token) {
				toast.error("You must be logged in to cancel trades");
				return;
			}
			await cancelTrade(token, tradeId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tradeDetails"] });
			toast.success("Trade cancelled successfully!");
		},
	});

	if (isLoading) {
		return <TradeCardSkeleton />;
	}

	return (
		<div className="bg-gray-100 min-h-screen py-20 px-4 mt-10">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-5xl font-extrabold text-center text-gray-800 mb-16 tracking-tight">
					Trade History
				</h1>
				<div className="flex justify-end mb-8">
					<Link href={"/trade"}>
						<Button className=" bg-violet-700 hover:bg-violet-800 text-white font-semibold px-6 py-3 rounded-lg shadow">
							<PlusCircle className="inline-block mr-2" />
							Propose Trade
						</Button>
					</Link>
				</div>

				{tradeDetails && tradeDetails.trades?.length > 0 ? (
					<div className="space-y-10">
						{tradeDetails.trades.map((trade) => (
							<div
								key={trade.id}
								className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
							>
								{/* Header */}
								<div className="bg-gray-200 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="flex items-center gap-4">
										{trade.proposingTeam.logo && (
											<img
												src={trade.proposingTeam.logo}
												alt={trade.proposingTeam.name}
												className="h-10 w-10 rounded-full border border-white shadow"
											/>
										)}
										<span className="text-black text-lg font-bold">
											{trade.proposingTeam.name}
										</span>
									</div>

									<div className="text-black text-3xl font-bold text-center sm:text-left">
										⇄
									</div>

									<div className="flex items-center gap-4">
										{trade.receivingTeam.logo && (
											<img
												src={trade.receivingTeam.logo}
												alt={trade.receivingTeam.name}
												className="h-10 w-10 rounded-full border border-white shadow"
											/>
										)}
										<span className="text-black text-lg font-bold">
											{trade.receivingTeam.name}
										</span>
									</div>
								</div>

								{/* Content */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
									{/* Left side */}
									<div>
										<h3 className="text-lg font-bold text-gray-700 mb-3">
											{trade.proposingTeam.name} Receive
										</h3>
										{trade.proposingTeamReceivedAssets
											?.length > 0 ? (
											<ul className="flex flex-wrap gap-3">
												{trade.proposingTeamReceivedAssets.map(
													(p) => (
														<li
															key={
																p.player?.id ||
																p.keep?.id
															}
															className="flex items-center gap-2 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full px-3 py-1 shadow-sm"
														>
															{p.player
																?.image && (
																<img
																	src={
																		p.player
																			.image
																	}
																	alt={
																		p.player
																			.name
																	}
																	className="h-6 w-6 rounded-full border border-gray-300 object-cover"
																/>
															)}
															{p.keep && (
																<div className="text-xs bg-indigo-300 text-white font-bold px-2 py-0.5 rounded-full">
																	{
																		p.keep
																			.odds
																	}
																</div>
															)}
															<span className="text-sm font-medium truncate max-w-[150px]">
																{p.player
																	?.name ||
																	`Keep ${p.keep?.odds}`}
															</span>
														</li>
													)
												)}
											</ul>
										) : (
											<p className="text-sm italic text-gray-500">
												None
											</p>
										)}
									</div>

									{/* Right side */}
									<div>
										<h3 className="text-lg font-bold text-gray-700 mb-3">
											{trade.receivingTeam.name} Receive
										</h3>
										{trade.receivingTeamReceivedAssets
											?.length > 0 ? (
											<ul className="flex flex-wrap gap-3">
												{trade.receivingTeamReceivedAssets.map(
													(p) => (
														<li
															key={
																p.player?.id ||
																p.keep?.id
															}
															className="flex items-center gap-2 bg-purple-50 text-purple-800 border border-purple-200 rounded-full px-3 py-1 shadow-sm"
														>
															{p.player
																?.image && (
																<img
																	src={
																		p.player
																			.image
																	}
																	alt={
																		p.player
																			.name
																	}
																	className="h-6 w-6 rounded-full border border-gray-300 object-cover"
																/>
															)}
															{p.keep && (
																<div className="text-xs bg-purple-300 text-white font-bold px-2 py-0.5 rounded-full">
																	{
																		p.keep
																			.odds
																	}
																</div>
															)}
															<span className="text-sm font-medium truncate max-w-[150px]">
																{p.player
																	?.name ||
																	`Keep ${p.keep?.odds}`}
															</span>
														</li>
													)
												)}
											</ul>
										) : (
											<p className="text-sm italic text-gray-500">
												None
											</p>
										)}
									</div>
								</div>

								{/* Footer */}
								<div className="px-8 py-4 border-t bg-gray-50">
									<div className="flex justify-between items-center mb-2">
										{/* Left side: Action Buttons */}
										<div className="flex gap-3">
											{trade.status === "Pending" &&
												tradeDetails.teamId ===
													trade.receivingTeam.id && (
													<>
														<Button
															className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow"
															disabled={
																(handleAcceptTrade.variables ===
																	trade.id &&
																	handleAcceptTrade.isPending) ||
																(handleDeclineTrade.variables ===
																	trade.id &&
																	handleDeclineTrade.isPending) ||
																(handleCancelTrade.variables ===
																	trade.id &&
																	handleCancelTrade.isPending)
															}
															onClick={() =>
																handleAcceptTrade.mutate(
																	trade.id
																)
															}
														>
															{handleAcceptTrade.isPending &&
															handleAcceptTrade.variables ===
																trade.id ? (
																<>
																	<Loader2 className="animate-spin h-4 w-4 mr-2" />
																	Accepting...
																</>
															) : (
																<>
																	<Check className="h-4 w-4 text-white" />{" "}
																	Accept
																</>
															)}
														</Button>
														<Button
															className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow"
															disabled={
																(handleAcceptTrade.variables ===
																	trade.id &&
																	handleAcceptTrade.isPending) ||
																(handleDeclineTrade.variables ===
																	trade.id &&
																	handleDeclineTrade.isPending) ||
																(handleCancelTrade.variables ===
																	trade.id &&
																	handleCancelTrade.isPending)
															}
															onClick={() =>
																handleDeclineTrade.mutate(
																	trade.id
																)
															}
														>
															{handleDeclineTrade.isPending &&
															handleDeclineTrade.variables ===
																trade.id ? (
																<>
																	<Loader2 className="animate-spin h-4 w-4 mr-1" />
																	Declining...
																</>
															) : (
																<>
																	<X className="h-4 w-4 text-white" />{" "}
																	Decline
																</>
															)}
														</Button>
													</>
												)}
											{trade.status === "Pending" &&
												tradeDetails.teamId ===
													trade.proposingTeam.id && (
													<Button
														className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow"
														disabled={
															(handleAcceptTrade.variables ===
																trade.id &&
																handleAcceptTrade.isPending) ||
															(handleDeclineTrade.variables ===
																trade.id &&
																handleDeclineTrade.isPending) ||
															(handleCancelTrade.variables ===
																trade.id &&
																handleCancelTrade.isPending)
														}
														onClick={() =>
															handleCancelTrade.mutate(
																trade.id
															)
														}
													>
														{handleCancelTrade.isPending &&
														handleCancelTrade.variables ===
															trade.id ? (
															<>
																<Loader2 className="animate-spin h-4 w-4 mr-2" />
																Cancelling...
															</>
														) : (
															"Cancel Trade"
														)}
													</Button>
												)}
										</div>

										{/* Right side: Status and Date */}
										<div className="flex items-center gap-2">
											<StatusBadge
												status={statusMap[trade.status]}
											>
												{trade.status}
											</StatusBadge>
											<span className="inline-block bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
												{new Date(
													trade.resolvedAt ??
														trade.proposedAt
												).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-gray-500 italic mt-12 text-lg">
						No trades have been made yet.
					</p>
				)}
			</div>
		</div>
	);
}
