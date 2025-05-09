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
								delay: 5000,
								stopOnInteraction: true,
							}),
						]}
						opts={{
							loop: true,
							dragFree: false,
							duration: 64,
						}}
					>
						<CarouselContent>
							{trades.map((trade) => (
								<CarouselItem key={trade.id} className="w-full">
									<div className="py-2 w-full mx-auto overflow-hidden">
										<div className="flex flex-col items-center justify-between text-gray-700">
											{/* Trade Content */}
											<div className="flex flex-col md:flex-row items-center justify-center w-full gap-4">
												{/* Left Team */}
												<div className="flex flex-col items-center w-full md:w-2/5">
													<div className="flex items-center gap-2 mb-2">
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
													<div className="flex flex-wrap gap-1 justify-center">
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
												</div>

												{/* Trade Direction Indicators */}
												<div className="flex flex-col items-center justify-center">
													<div className="flex items-center justify-center">
														<span className="text-gray-500 text-lg md:text-xl">
															⇄
														</span>
													</div>
													<div className="text-xs text-gray-700 font-medium mt-1">
														Trade Completed
													</div>
													<div className="text-xs text-gray-500 mt-0.5">
														{new Date(
															trade.resolvedAt ??
																trade.proposedAt
														).toLocaleDateString()}
													</div>
												</div>

												{/* Right Team */}
												<div className="flex flex-col items-center w-full md:w-2/5">
													<div className="flex items-center gap-2 mb-2">
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
													<div className="flex flex-wrap gap-1 justify-center">
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
												</div>
											</div>
										</div>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="ml-2" />
						<CarouselNext className="mr-2" />
					</Carousel>
				)}
			</div>
		</div>
	);
}
