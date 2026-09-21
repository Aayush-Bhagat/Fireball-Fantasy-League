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
import {
    PlusCircle,
    Loader2,
    Check,
    X,
    ArrowRight,
    ArrowLeftRight,
    Clock3,
    CheckCircle2,
    XCircle,
    Ban,
    Package,
} from "lucide-react";
import Link from "next/link";
import { TradeAssetDto } from "@/dtos/tradeDtos";
import { TradeCardSkeleton } from "@/components/loaders/TeamTradesSkeleton";

/* =========================================================
   STATUS ICON
========================================================= */

function getStatusIcon(status: string) {
    switch (status) {
        case "Accepted":
            return <CheckCircle2 className="h-4 w-4" />;

        case "Pending":
            return <Clock3 className="h-4 w-4" />;

        case "Declined":
            return <XCircle className="h-4 w-4" />;

        case "Canceled":
            return <Ban className="h-4 w-4" />;

        case "Countered":
            return <ArrowLeftRight className="h-4 w-4" />;

        default:
            return <Clock3 className="h-4 w-4" />;
    }
}

/* =========================================================
   ASSET NAME
========================================================= */

function getAssetName(asset: TradeAssetDto) {
    if (asset.player?.name) {
        return asset.player.name;
    }

    if (asset.draftPick) {
        return `Round ${asset.draftPick.round} Pick`;
    }

    if (asset.keep) {
        return `Keep (${asset.keep.odds})`;
    }

    return "Unknown Asset";
}

/* =========================================================
   ASSET LIST
========================================================= */

function AssetList({
    assets,
    variant,
}: {
    assets: TradeAssetDto[];
    variant: "indigo" | "violet";
}) {
    if (!assets || assets.length === 0) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
                <Package className="h-4 w-4" />
                <span>No assets</span>
            </div>
        );
    }

    const styles =
        variant === "indigo"
            ? {
                  wrapper:
                      "border-indigo-100 bg-indigo-50/70 hover:border-indigo-200",
                  badge: "bg-indigo-100 text-indigo-700",
                  accent: "bg-indigo-600",
              }
            : {
                  wrapper:
                      "border-violet-100 bg-violet-50/70 hover:border-violet-200",
                  badge: "bg-violet-100 text-violet-700",
                  accent: "bg-violet-600",
              };

    return (
        <div className="space-y-2">
            {assets.map((asset, index) => (
                <div
                    key={
                        asset.player?.id ??
                        asset.keep?.id ??
                        asset.draftPick?.id ??
                        index
                    }
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm ${styles.wrapper}`}
                >
                    {/* Player Image */}
                    {asset.player?.image ? (
                        <img
                            src={asset.player.image}
                            alt={asset.player.name}
                            className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                    ) : (
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.accent} text-white`}
                        >
                            {asset.draftPick ? (
                                <span className="text-xs font-bold">P</span>
                            ) : (
                                <Package className="h-4 w-4" />
                            )}
                        </div>
                    )}

                    {/* Asset Name */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">
                            {getAssetName(asset)}
                        </p>

                        {asset.draftPick && (
                            <p className="text-[11px] text-gray-500">
                                Season {asset.draftPick.seasonId} · Round{" "}
                                {asset.draftPick.round}
                            </p>
                        )}

                        {asset.keep && (
                            <p className="text-[11px] text-gray-500">
                                Keep asset
                            </p>
                        )}
                    </div>

                    {/* Asset Type */}
                    {asset.player && (
                        <span
                            className={`hidden rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline-flex ${styles.badge}`}
                        >
                            Player
                        </span>
                    )}

                    {asset.draftPick && (
                        <span
                            className={`hidden rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline-flex ${styles.badge}`}
                        >
                            Pick
                        </span>
                    )}

                    {asset.keep && (
                        <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                        >
                            {asset.keep.odds}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

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

    /* =====================================================
       ACCEPT TRADE
    ===================================================== */

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
            queryClient.invalidateQueries({
                queryKey: ["tradeDetails"],
            });

            toast.success("Trade accepted successfully!");
        },

        onError: () => {
            toast.error("Failed to accept trade.");
        },
    });

    /* =====================================================
       DECLINE TRADE
    ===================================================== */

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
            queryClient.invalidateQueries({
                queryKey: ["tradeDetails"],
            });

            toast.success("Trade declined.");
        },

        onError: () => {
            toast.error("Failed to decline trade.");
        },
    });

    /* =====================================================
       CANCEL TRADE
    ===================================================== */

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
            queryClient.invalidateQueries({
                queryKey: ["tradeDetails"],
            });

            toast.success("Trade cancelled.");
        },

        onError: () => {
            toast.error("Failed to cancel trade.");
        },
    });

    /* =====================================================
       LOADING
    ===================================================== */

    if (isLoading) {
        return <TradeCardSkeleton />;
    }

    const trades = tradeDetails?.trades ?? [];

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-violet-50/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                                    <ArrowLeftRight className="h-5 w-5 text-violet-700" />
                                </div>

                                <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                                    Team Management
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Trades
                            </h1>

                            <p className="mt-1 text-sm text-gray-500 sm:text-base">
                                View, manage, and respond to your trade offers.
                            </p>
                        </div>

                        <Link href="/trade">
                            <Button className="h-10 rounded-xl bg-violet-700 px-5 font-semibold shadow-sm transition-all hover:bg-violet-800 hover:shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Propose Trade
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* =====================================================
                    EMPTY STATE
                ===================================================== */}

                {trades.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
                            <ArrowLeftRight className="h-8 w-8 text-violet-600" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            No trades yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            You don&apos;t have any trade offers yet. Start by
                            proposing a trade with another team.
                        </p>

                        <Link href="/trade">
                            <Button className="mt-6 rounded-xl bg-violet-700 px-5 font-semibold hover:bg-violet-800">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Propose Your First Trade
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* =====================================================
                       TRADE LIST
                    ===================================================== */

                    <div className="space-y-5">
                        {trades.map((trade) => {
                            const isReceivingTeam =
                                tradeDetails?.teamId === trade.receivingTeam.id;

                            const isProposingTeam =
                                tradeDetails?.teamId === trade.proposingTeam.id;

                            const isPending = trade.status === "Pending";

                            const isProcessing =
                                (handleAcceptTrade.isPending &&
                                    handleAcceptTrade.variables === trade.id) ||
                                (handleDeclineTrade.isPending &&
                                    handleDeclineTrade.variables ===
                                        trade.id) ||
                                (handleCancelTrade.isPending &&
                                    handleCancelTrade.variables === trade.id);

                            return (
                                <div
                                    key={trade.id}
                                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                                        isPending
                                            ? "border-amber-200"
                                            : "border-gray-200"
                                    }`}
                                >
                                    {/* =================================================
                                        TRADE HEADER
                                    ================================================= */}

                                    <div
                                        className={`flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                                            isPending
                                                ? "bg-gradient-to-r from-amber-50 to-white"
                                                : "bg-gray-50/70"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Proposing Team */}

                                            <div className="flex items-center gap-2">
                                                {trade.proposingTeam.logo ? (
                                                    <img
                                                        src={
                                                            trade.proposingTeam
                                                                .logo
                                                        }
                                                        alt={
                                                            trade.proposingTeam
                                                                .name
                                                        }
                                                        className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-violet-100" />
                                                )}

                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {
                                                            trade.proposingTeam
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="text-[11px] text-gray-400">
                                                        Proposing team
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Arrow */}

                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                                                <ArrowRight className="h-4 w-4 text-violet-600" />
                                            </div>

                                            {/* Receiving Team */}

                                            <div className="flex items-center gap-2">
                                                {trade.receivingTeam.logo ? (
                                                    <img
                                                        src={
                                                            trade.receivingTeam
                                                                .logo
                                                        }
                                                        alt={
                                                            trade.receivingTeam
                                                                .name
                                                        }
                                                        className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-violet-100" />
                                                )}

                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {
                                                            trade.receivingTeam
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="text-[11px] text-gray-400">
                                                        Receiving team
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}

                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    trade.status === "Pending"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : trade.status ===
                                                            "Accepted"
                                                          ? "bg-emerald-100 text-emerald-700"
                                                          : trade.status ===
                                                              "Declined"
                                                            ? "bg-red-100 text-red-700"
                                                            : trade.status ===
                                                                "Canceled"
                                                              ? "bg-gray-100 text-gray-600"
                                                              : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {getStatusIcon(trade.status)}
                                                {trade.status}
                                            </div>

                                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-gray-200">
                                                {new Date(
                                                    trade.resolvedAt ??
                                                        trade.proposedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* =================================================
                                        TRADE BODY
                                    ================================================= */}

                                    <div className="p-5 sm:p-6">
                                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                                            {/* =================================================
                                                PROPOSING TEAM RECEIVES
                                            ================================================= */}

                                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                                                            Receives
                                                        </p>

                                                        <h3 className="mt-0.5 font-bold text-gray-900">
                                                            {
                                                                trade
                                                                    .proposingTeam
                                                                    .name
                                                            }
                                                        </h3>
                                                    </div>

                                                    <div className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                                                        {
                                                            trade
                                                                .proposingTeamReceivedAssets
                                                                ?.length
                                                        }{" "}
                                                        asset
                                                        {trade
                                                            .proposingTeamReceivedAssets
                                                            ?.length !== 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                </div>

                                                <AssetList
                                                    assets={
                                                        trade.proposingTeamReceivedAssets ??
                                                        []
                                                    }
                                                    variant="indigo"
                                                />
                                            </div>

                                            {/* =================================================
                                                CENTER
                                            ================================================= */}

                                            <div className="flex items-center justify-center">
                                                <div className="hidden h-full w-px bg-gray-100 lg:block" />

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm lg:absolute">
                                                    <ArrowLeftRight className="h-4 w-4 text-violet-500" />
                                                </div>
                                            </div>

                                            {/* =================================================
                                                RECEIVING TEAM RECEIVES
                                            ================================================= */}

                                            <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-violet-500">
                                                            Receives
                                                        </p>

                                                        <h3 className="mt-0.5 font-bold text-gray-900">
                                                            {
                                                                trade
                                                                    .receivingTeam
                                                                    .name
                                                            }
                                                        </h3>
                                                    </div>

                                                    <div className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-bold text-violet-700">
                                                        {
                                                            trade
                                                                .receivingTeamReceivedAssets
                                                                ?.length
                                                        }{" "}
                                                        asset
                                                        {trade
                                                            .receivingTeamReceivedAssets
                                                            ?.length !== 1
                                                            ? "s"
                                                            : ""}
                                                    </div>
                                                </div>

                                                <AssetList
                                                    assets={
                                                        trade.receivingTeamReceivedAssets ??
                                                        []
                                                    }
                                                    variant="violet"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* =================================================
                                        FOOTER / ACTIONS
                                    ================================================= */}

                                    <div
                                        className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                                            isPending
                                                ? "bg-amber-50/40"
                                                : "bg-gray-50"
                                        }`}
                                    >
                                        {/* Trade Status Message */}

                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {isPending ? (
                                                <>
                                                    <Clock3 className="h-4 w-4 text-amber-500" />

                                                    {isReceivingTeam
                                                        ? "Waiting for your response"
                                                        : "Waiting for the other team"}
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                                    Trade{" "}
                                                    {trade.status.toLowerCase()}
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}

                                        <div className="flex flex-wrap gap-2">
                                            {/* Receiving Team Actions */}

                                            {isPending && isReceivingTeam && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="rounded-lg bg-emerald-600 px-4 font-semibold shadow-sm hover:bg-emerald-700"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleAcceptTrade.mutate(
                                                                trade.id,
                                                            )
                                                        }
                                                    >
                                                        {handleAcceptTrade.isPending &&
                                                        handleAcceptTrade.variables ===
                                                            trade.id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Accepting
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="mr-1.5 h-4 w-4" />
                                                                Accept
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-lg border-red-200 px-4 font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            handleDeclineTrade.mutate(
                                                                trade.id,
                                                            )
                                                        }
                                                    >
                                                        {handleDeclineTrade.isPending &&
                                                        handleDeclineTrade.variables ===
                                                            trade.id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Declining
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="mr-1.5 h-4 w-4" />
                                                                Decline
                                                            </>
                                                        )}
                                                    </Button>
                                                </>
                                            )}

                                            {/* Proposing Team Action */}

                                            {isPending && isProposingTeam && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-lg border-red-200 px-4 font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    disabled={isProcessing}
                                                    onClick={() =>
                                                        handleCancelTrade.mutate(
                                                            trade.id,
                                                        )
                                                    }
                                                >
                                                    {handleCancelTrade.isPending &&
                                                    handleCancelTrade.variables ===
                                                        trade.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Cancelling
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="mr-1.5 h-4 w-4" />
                                                            Cancel Trade
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
