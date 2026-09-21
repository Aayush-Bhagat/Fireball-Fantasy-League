"use client";

import React, { use, useMemo, useState } from "react";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { TeamLineupDto, TeamRosterDto } from "@/dtos/teamDtos";
import { saveBattingOrder } from "@/requests/lineup";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

import {
    GripVertical,
    ChevronUp,
    ChevronDown,
    RotateCcw,
    Save,
    Check,
    User,
    CircleDot,
} from "lucide-react";

interface Props {
    rosterData: Promise<TeamRosterDto>;
    battingOrderData: Promise<TeamLineupDto>;
}

export default function BattingOrder({ rosterData, battingOrderData }: Props) {
    const supabase = createClient();

    const { roster } = use(rosterData);
    const { battingOrder } = use(battingOrderData);

    const initialOrder = useMemo(() => {
        const orderedPlayers: PlayerWithStatsDto[] = [];

        battingOrder.forEach((lineupPlayer) => {
            const player = roster.find((p) => p.id === lineupPlayer?.id);

            if (player && !orderedPlayers.some((p) => p.id === player.id)) {
                orderedPlayers.push(player);
            }
        });

        roster.forEach((player) => {
            if (!orderedPlayers.some((p) => p.id === player.id)) {
                orderedPlayers.push(player);
            }
        });

        return orderedPlayers;
    }, [roster, battingOrder]);

    const [battingOrderD, setBattingOrder] =
        useState<PlayerWithStatsDto[]>(initialOrder);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const hasChanges = useMemo(() => {
        if (battingOrderD.length !== initialOrder.length) {
            return true;
        }

        return battingOrderD.some(
            (player, index) => player.id !== initialOrder[index]?.id,
        );
    }, [battingOrderD, initialOrder]);

    const startingLineup = battingOrderD.slice(0, 9);

    const movePlayer = (fromIndex: number, toIndex: number) => {
        if (
            fromIndex < 0 ||
            fromIndex >= battingOrderD.length ||
            toIndex < 0 ||
            toIndex >= battingOrderD.length
        ) {
            return;
        }

        const updatedOrder = [...battingOrderD];

        const [player] = updatedOrder.splice(fromIndex, 1);

        updatedOrder.splice(toIndex, 0, player);

        setBattingOrder(updatedOrder);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;

        movePlayer(index, index - 1);
    };

    const moveDown = (index: number) => {
        if (index === battingOrderD.length - 1) return;

        movePlayer(index, index + 1);
    };

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        index: number,
    ) => {
        setDraggedIndex(index);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        targetIndex: number,
    ) => {
        e.preventDefault();

        const sourceIndex = Number(e.dataTransfer.getData("text/plain"));

        if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) {
            setDraggedIndex(null);
            return;
        }

        movePlayer(sourceIndex, targetIndex);

        setDraggedIndex(null);
    };

    const handleReset = () => {
        setBattingOrder(initialOrder);

        toast("Lineup reset", {
            description: "Your unsaved changes have been removed.",
        });
    };

    const handleSave = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to save a batting order");
            return;
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
            toast.error("You must be logged in to save a batting order");
            return;
        }

        const newBattingOrder = battingOrderD.map((player) => player.id);

        await saveBattingOrder(
            {
                battingOrder: newBattingOrder,
            },
            token,
        );
    };

    const { mutate, isPending } = useMutation({
        mutationFn: handleSave,

        onSuccess: () => {
            toast.success("Batting order saved!", {
                description: "Your new lineup has been saved successfully.",
            });
        },

        onError: (error) => {
            console.error("Error saving batting order:", error);

            toast.error("Unable to save batting order", {
                description: "Please refresh the page and try again.",
            });
        },
    });

    const getAverage = (player: PlayerWithStatsDto) => {
        const average = player.stats?.battingAverage;

        if (average === undefined || average === null) {
            return "—";
        }

        return Number(average).toFixed(3);
    };

    const PlayerAvatar = ({ player }: { player: PlayerWithStatsDto }) => {
        if (player.image) {
            return (
                <img
                    src={player.image}
                    alt={player.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                />
            );
        }

        return (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-2 ring-slate-100">
                <User className="h-6 w-6" />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                                <CircleDot className="h-4 w-4" />
                                Team Lineup
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Batting Order
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Arrange your starting nine in the order they
                                will bat.
                            </p>
                        </div>

                        {/* Status */}
                        <div
                            className={`flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold ${
                                hasChanges
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                        >
                            {hasChanges ? (
                                <>
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    Unsaved changes
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Lineup saved
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* =========================================================
                CONTENT
            ========================================================= */}

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                {/* Lineup Card */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Lineup Header */}

                    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Starting Lineup
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Drag players to reorder them.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column labels */}

                    <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 sm:grid sm:grid-cols-[48px_28px_56px_1fr_180px_70px] sm:items-center sm:gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            #
                        </span>

                        <span />

                        <span />

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Player
                        </span>

                        <span className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Statistics
                        </span>

                        <span />
                    </div>

                    {/* Players */}

                    <div className="divide-y divide-slate-100">
                        {startingLineup.map((player, index) => {
                            const globalIndex = index;

                            const isDragging = draggedIndex === globalIndex;

                            return (
                                <div
                                    key={player.id}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, globalIndex)
                                    }
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, globalIndex)}
                                    className={`group relative grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-4 transition-all sm:grid-cols-[48px_28px_56px_1fr_180px_70px] sm:gap-4 sm:px-6 ${
                                        isDragging
                                            ? "bg-blue-50 opacity-50"
                                            : index % 2 === 0
                                              ? "bg-white hover:bg-slate-50"
                                              : "bg-slate-50/40 hover:bg-slate-50"
                                    }`}
                                >
                                    {/* Number */}

                                    <div className="flex justify-center">
                                        <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                                                index === 0
                                                    ? "bg-blue-600 text-white"
                                                    : index < 3
                                                      ? "bg-blue-50 text-blue-700"
                                                      : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {index + 1}
                                        </span>
                                    </div>

                                    {/* Drag Handle */}

                                    <div className="hidden sm:block">
                                        <GripVertical className="h-5 w-5 cursor-grab text-slate-300 transition-colors group-hover:text-slate-500" />
                                    </div>

                                    {/* Avatar */}

                                    <PlayerAvatar player={player} />

                                    {/* Player */}

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate text-base font-bold text-slate-900">
                                                {player.name}
                                            </h3>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Batting #{index + 1}
                                        </p>
                                    </div>

                                    {/* Stats */}

                                    <div className="hidden items-center justify-center gap-5 sm:flex">
                                        <div className="min-w-[45px] text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                AVG
                                            </p>

                                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                                                {getAverage(player)}
                                            </p>
                                        </div>

                                        <div className="min-w-[40px] text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                HR
                                            </p>

                                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                                                {player.stats?.homeRuns ?? 0}
                                            </p>
                                        </div>

                                        <div className="min-w-[40px] text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                RBI
                                            </p>

                                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                                                {player.stats?.rbis ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mobile Stats */}

                                    <div className="flex flex-col items-end sm:hidden">
                                        <span className="text-xs font-bold text-slate-700">
                                            AVG {getAverage(player)}
                                        </span>

                                        <span className="mt-0.5 text-[11px] text-slate-400">
                                            {player.stats?.homeRuns} HR •{" "}
                                            {player.stats?.rbis} RBI
                                        </span>
                                    </div>

                                    {/* Controls */}

                                    <div className="flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-1">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => moveUp(globalIndex)}
                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-20"
                                            aria-label={`Move ${player.name} up`}
                                        >
                                            <ChevronUp className="h-5 w-5" />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                index ===
                                                startingLineup.length - 1
                                            }
                                            onClick={() =>
                                                moveDown(globalIndex)
                                            }
                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-20"
                                            aria-label={`Move ${player.name} down`}
                                        >
                                            <ChevronDown className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty lineup warning */}

                    {startingLineup.length < 9 && (
                        <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 sm:px-6">
                            <div className="flex items-start gap-3">
                                <CircleDot className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                <div>
                                    <p className="font-semibold text-amber-900">
                                        Your lineup has fewer than 9 players
                                    </p>

                                    <p className="mt-1 text-sm text-amber-700">
                                        Add players to your lineup before
                                        saving.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* =========================================================
                SAVE BAR
            ========================================================= */}

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Status */}

                    <div className="hidden sm:block">
                        {hasChanges ? (
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    You have unsaved changes
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Save your lineup when you&apos;re finished.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-600" />

                                <p className="text-sm font-medium text-slate-600">
                                    Lineup is up to date
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}

                    <div className="flex w-full justify-end gap-2 sm:w-auto">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={!hasChanges || isPending}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw className="h-4 w-4" />

                            <span className="hidden sm:inline">Reset</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => mutate()}
                            disabled={!hasChanges || isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:flex-none"
                        >
                            {isPending ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Lineup
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
