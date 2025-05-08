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
import { Card, CardContent } from "@/components/ui/card";

type Props = {
    tradesData: Promise<TradeResponseDto>;
};

export default function TradesTable({ tradesData }: Props) {
    const { trades } = use(tradesData);

    return (
        <div className=" max-w-full mx-auto p-6 mb-8 rounded-xl ">
            {trades.length === 0 ? (
                <p className="text-center text-white">
                    No completed trades to show.
                </p>
            ) : (
                <Carousel className="w-full">
                    <CarouselContent>
                        {trades.map((trade) => (
                            <CarouselItem key={trade.id}>
                                <Card className="p-6 border shadow-lg rounded-xl bg-white">
                                    <CardContent className="space-y-4">
                                        <h2 className="text-2xl font-bold text-center mb-2">
                                            Completed Trade
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Proposing Team */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {trade.proposingTeam
                                                        .logo && (
                                                        <img
                                                            src={
                                                                trade
                                                                    .proposingTeam
                                                                    .logo
                                                            }
                                                            alt={`${trade.proposingTeam.name} logo`}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    )}
                                                    <h3 className="text-xl font-semibold">
                                                        {
                                                            trade.proposingTeam
                                                                .name
                                                        }
                                                    </h3>
                                                </div>

                                                <div>
                                                    <p className="text-green-600 font-medium mb-1">
                                                        Received:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {trade.proposingTeamReceivedAssets.map(
                                                            (a, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg"
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
                                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                                />
                                                                            )}
                                                                            <span className="text-sm">
                                                                                {
                                                                                    a
                                                                                        .player
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {a.keep && (
                                                                        <>
                                                                            <span className="text-sm text-gray-800">
                                                                                {
                                                                                    a
                                                                                        .keep
                                                                                        .odds
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Receiving Team */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {trade.receivingTeam
                                                        .logo && (
                                                        <img
                                                            src={
                                                                trade
                                                                    .receivingTeam
                                                                    .logo
                                                            }
                                                            alt={`${trade.receivingTeam.name} logo`}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    )}
                                                    <h3 className="text-xl font-semibold">
                                                        {
                                                            trade.receivingTeam
                                                                .name
                                                        }
                                                    </h3>
                                                </div>

                                                <div>
                                                    <p className="text-green-600 font-medium mb-1">
                                                        Received:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {trade.receivingTeamReceivedAssets.map(
                                                            (a, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg"
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
                                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                                />
                                                                            )}
                                                                            <span className="text-sm">
                                                                                {
                                                                                    a
                                                                                        .player
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {a.keep && (
                                                                        <>
                                                                            <span className="text-sm text-gray-800">
                                                                                {
                                                                                    a
                                                                                        .keep
                                                                                        .odds
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 text-right mt-4">
                                            Resolved on:{" "}
                                            {new Date(
                                                trade.resolvedAt ??
                                                    trade.proposedAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="flex justify-between mt-4 px-2">
                        <CarouselPrevious />
                        <CarouselNext />
                    </div>
                </Carousel>
            )}
        </div>
    );
}
