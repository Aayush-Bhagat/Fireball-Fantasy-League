"use client";

import React, { use } from "react";
import { TradeResponseDto } from "@/dtos/tradeDtos";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type Props = {
	tradesData: Promise<TradeResponseDto>;
};

export default function TradesTable({ tradesData }: Props) {
	const { trades } = use(tradesData);

	return (
		<div className="w-full inline-block bg-gradient-to-r from-white via-white to-white shadow-md relative rounded-lg">
			<div className="mx-auto py-2 px-12 flex items-center justify-center">
				{trades.length === 0 ? (
					<p className="text-center text-gray-700 text-sm py-2">
						No completed trades to show.
					</p>
				) : (
					<Carousel
						className="w-full"
						plugins={[
							Autoplay({
								delay: 2000,
							}),
						]}
					>
						<CarouselPrevious className="ml-2" />
						<CarouselNext className="mr-2" />
						<CarouselContent className="flex items-center justify-center">
							{trades.map((trade) => (
								<CarouselItem
									key={trade.id}
									className="flex justify-center"
								>
									<div className="py-2 w-full max-w-3xl">
										<div className="flex flex-col md:flex-row items-center justify-between text-gray-700">
											<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 w-full">
												{/* Proposing Team Assets */}
												<div className="flex flex-col md:flex-row items-center w-full md:w-auto">
													<div className="hidden md:flex flex-wrap gap-1 justify-start">
														{trade.proposingTeamReceivedAssets.map(
															(a, idx) => (
																<div
																	key={idx}
																	className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded"
																>
																	{a.player && (
																		<>
																			{a
																				.player
																				.image && (
																				<img
																					src={
																						a
																							.player
																							.image
																					}
																					alt={
																						a
																							.player
																							.name
																					}
																					className="w-4 h-4 rounded-full mr-1"
																				/>
																			)}
																			<span className="text-xs">
																				{
																					a
																						.player
																						.name
																				}
																			</span>
																		</>
																	)}
																	{a.keep && (
																		<span className="text-xs">
																			Keep
																			(Season{" "}
																			{
																				a
																					.keep
																					.seasonId
																			}
																			) :{" "}
																			{
																				a
																					.keep
																					.odds
																			}
																		</span>
																	)}
																</div>
															)
														)}
													</div>

													<div className="md:hidden flex flex-wrap gap-1 justify-center mb-1">
														{trade.proposingTeamReceivedAssets.map(
															(a, idx) => (
																<div
																	key={idx}
																	className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded"
																>
																	{a.player && (
																		<>
																			{a
																				.player
																				.image && (
																				<img
																					src={
																						a
																							.player
																							.image
																					}
																					alt={
																						a
																							.player
																							.name
																					}
																					className="w-4 h-4 rounded-full mr-1"
																				/>
																			)}
																			<span className="text-xs">
																				{
																					a
																						.player
																						.name
																				}
																			</span>
																		</>
																	)}
																	{a.keep && (
																		<span className="text-xs">
																			Keep
																			(Season{" "}
																			{
																				a
																					.keep
																					.seasonId
																			}
																			) :{" "}
																			{
																				a
																					.keep
																					.odds
																			}
																		</span>
																	)}
																</div>
															)
														)}
													</div>

													<div className="md:hidden flex items-center justify-center w-full my-1">
														<span className="text-gray-500 text-lg">
															↓
														</span>
													</div>

													<div className="md:hidden flex items-center gap-2 mt-1">
														{trade.proposingTeam
															.logo && (
															<img
																src={
																	trade
																		.proposingTeam
																		.logo
																}
																alt={`${trade.proposingTeam.name} logo`}
																className="w-6 h-6 rounded-full"
															/>
														)}
														<span className="text-xs font-medium">
															{
																trade
																	.proposingTeam
																	.name
															}
														</span>
													</div>

													<span className="hidden md:inline mx-2 text-gray-500">
														→
													</span>
													<div className="hidden md:flex items-center gap-2">
														{trade.proposingTeam
															.logo && (
															<img
																src={
																	trade
																		.proposingTeam
																		.logo
																}
																alt={`${trade.proposingTeam.name} logo`}
																className="w-6 h-6 rounded-full"
															/>
														)}
														<span className="text-xs font-medium">
															{
																trade
																	.proposingTeam
																	.name
															}
														</span>
													</div>
												</div>

												{/* Trade Status and Date */}
												<div className="flex md:hidden flex-col items-center text-center px-2 my-2">
													<div className="text-xs text-gray-700 font-medium">
														Trade Completed
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{new Date(
															trade.resolvedAt ??
																trade.proposedAt
														).toLocaleDateString()}
													</div>
												</div>
												<div className="hidden md:flex flex-col items-center text-center px-2">
													<div className="text-xs text-gray-700 font-medium">
														Trade Completed
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{new Date(
															trade.resolvedAt ??
																trade.proposedAt
														).toLocaleDateString()}
													</div>
												</div>

												{/* Receiving Team Assets */}
												<div className="flex flex-col md:flex-row items-center w-full md:w-auto">
													<div className="hidden md:flex flex-wrap gap-1 justify-start">
														{trade.receivingTeamReceivedAssets.map(
															(a, idx) => (
																<div
																	key={idx}
																	className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded"
																>
																	{a.player && (
																		<>
																			{a
																				.player
																				.image && (
																				<img
																					src={
																						a
																							.player
																							.image
																					}
																					alt={
																						a
																							.player
																							.name
																					}
																					className="w-4 h-4 rounded-full mr-1"
																				/>
																			)}
																			<span className="text-xs">
																				{
																					a
																						.player
																						.name
																				}
																			</span>
																		</>
																	)}
																	{a.keep && (
																		<span className="text-xs">
																			Keep
																			(Season{" "}
																			{
																				a
																					.keep
																					.seasonId
																			}
																			) :{" "}
																			{
																				a
																					.keep
																					.odds
																			}
																		</span>
																	)}
																</div>
															)
														)}
													</div>

													<div className="md:hidden flex flex-wrap gap-1 justify-center mb-1">
														{trade.receivingTeamReceivedAssets.map(
															(a, idx) => (
																<div
																	key={idx}
																	className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded"
																>
																	{a.player && (
																		<>
																			{a
																				.player
																				.image && (
																				<img
																					src={
																						a
																							.player
																							.image
																					}
																					alt={
																						a
																							.player
																							.name
																					}
																					className="w-4 h-4 rounded-full mr-1"
																				/>
																			)}
																			<span className="text-xs">
																				{
																					a
																						.player
																						.name
																				}
																			</span>
																		</>
																	)}
																	{a.keep && (
																		<span className="text-xs">
																			Keep
																			(Season{" "}
																			{
																				a
																					.keep
																					.seasonId
																			}
																			) :{" "}
																			{
																				a
																					.keep
																					.odds
																			}
																		</span>
																	)}
																</div>
															)
														)}
													</div>

													<div className="md:hidden flex items-center justify-center w-full my-1">
														<span className="text-gray-500 text-lg">
															↓
														</span>
													</div>

													<div className="md:hidden flex items-center gap-2 mt-1">
														{trade.receivingTeam
															.logo && (
															<img
																src={
																	trade
																		.receivingTeam
																		.logo
																}
																alt={`${trade.receivingTeam.name} logo`}
																className="w-6 h-6 rounded-full"
															/>
														)}
														<span className="text-xs font-medium">
															{
																trade
																	.receivingTeam
																	.name
															}
														</span>
													</div>

													<span className="hidden md:inline mx-2 text-gray-500">
														→
													</span>
													<div className="hidden md:flex items-center gap-2">
														{trade.receivingTeam
															.logo && (
															<img
																src={
																	trade
																		.receivingTeam
																		.logo
																}
																alt={`${trade.receivingTeam.name} logo`}
																className="w-6 h-6 rounded-full"
															/>
														)}
														<span className="text-xs font-medium">
															{
																trade
																	.receivingTeam
																	.name
															}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				)}
			</div>
		</div>
	);
}
