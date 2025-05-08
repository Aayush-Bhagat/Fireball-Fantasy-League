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
							}),
						]}
					>
						<CarouselPrevious className="ml-0 sm:ml-2 -left-1 sm:left-0" />
						<CarouselNext className="mr-0 sm:mr-2 -right-1 sm:right-0" />
						<CarouselContent className="flex items-center justify-center">
							{trades.map((trade) => (
								<CarouselItem
									key={trade.id}
									className="flex justify-center"
								>
									<div className="flex flex-col md:flex-row justify-between items-center text-gray-700 gap-3 w-full max-w-4xl mx-auto">
										{/* Trade Status and Date - Mobile (top) */}
										<div className="flex md:hidden flex-col items-center text-center w-full mb-2">
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

										{/* Proposing Team Assets */}
										<div className="flex items-center w-full md:w-[45%]">
											<div className="flex flex-wrap gap-1 flex-1">
												{trade.proposingTeamReceivedAssets.map(
													(a, idx) => (
														<React.Fragment
															key={idx}
														>
															{idx > 0 && (
																<span className="text-gray-500 text-xs flex items-center mx-0.5">
																	+
																</span>
															)}
															<div className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded">
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
																		):{" "}
																		{
																			a
																				.keep
																				.odds
																		}
																	</span>
																)}
															</div>
														</React.Fragment>
													)
												)}
											</div>
											<span className="ml-1 mr-2 text-gray-500">
												→
											</span>
											<div className="flex items-center gap-2 min-w-[60px]">
												{trade.proposingTeam.logo && (
													<img
														src={
															trade.proposingTeam
																.logo
														}
														alt={`${trade.proposingTeam.name} logo`}
														className="w-6 h-6 rounded-full"
													/>
												)}
												<span className="text-xs font-medium hidden sm:inline">
													{trade.proposingTeam.name}
												</span>
											</div>
										</div>

										{/* Trade Status and Date - Desktop (middle) */}
										<div className="hidden md:flex flex-col items-center text-center px-2 w-[10%]">
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
										<div className="flex items-center w-full md:w-[45%]">
											<div className="flex flex-wrap gap-1 flex-1">
												{trade.receivingTeamReceivedAssets.map(
													(a, idx) => (
														<React.Fragment
															key={idx}
														>
															{idx > 0 && (
																<span className="text-gray-500 text-xs flex items-center mx-0.5">
																	+
																</span>
															)}
															<div className="flex items-center bg-gray-200/70 px-1.5 py-0.5 rounded">
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
																		):{" "}
																		{
																			a
																				.keep
																				.odds
																		}
																	</span>
																)}
															</div>
														</React.Fragment>
													)
												)}
											</div>
											<span className="ml-1 mr-2 text-gray-500">
												→
											</span>
											<div className="flex items-center gap-2 min-w-[60px]">
												{trade.receivingTeam.logo && (
													<img
														src={
															trade.receivingTeam
																.logo
														}
														alt={`${trade.receivingTeam.name} logo`}
														className="w-6 h-6 rounded-full"
													/>
												)}
												<span className="text-xs font-medium hidden sm:inline">
													{trade.receivingTeam.name}
												</span>
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
