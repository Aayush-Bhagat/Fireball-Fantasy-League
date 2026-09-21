"use client";

import React, { use, useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TeamLineupDto,
    TeamRosterDto,
    TeamLineupPosition,
} from "@/dtos/teamDtos";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { saveLineup } from "@/requests/lineup";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const positions = [
    { key: "P", label: "Pitcher", top: "60%", left: "50%" },
    { key: "C", label: "Catcher", top: "87%", left: "50%" },
    { key: "1B", label: "1st Base", top: "58%", left: "78%" },
    { key: "2B", label: "2nd Base", top: "40%", left: "68%" },
    { key: "3B", label: "3rd Base", top: "58%", left: "20%" },
    { key: "SS", label: "Shortstop", top: "40%", left: "30%" },
    { key: "LF", label: "Left Field", top: "20%", left: "15%" },
    { key: "CF", label: "Center Field", top: "10%", left: "50%" },
    { key: "RF", label: "Right Field", top: "20%", left: "85%" },
] as const;

interface Props {
    lineupData: Promise<TeamLineupDto>;
    rosterData: Promise<TeamRosterDto>;
}

export default function EditLineup({ lineupData, rosterData }: Props) {
    const [selectedPlayers, setSelectedPlayers] = useState<
        Record<TeamLineupPosition, string | null>
    >({
        P: null,
        C: null,
        "1B": null,
        "2B": null,
        "3B": null,
        SS: null,
        LF: null,
        CF: null,
        RF: null,
    });

    const [hoveredPlayer, setHoveredPlayer] = useState<{
        playerId: string;
        top: string;
        left: string;
        position: TeamLineupPosition;
    } | null>(null);

    const { fieldingLineup } = use(lineupData);
    const { roster } = use(rosterData);

    /*
     * Load existing lineup
     */
    useEffect(() => {
        if (fieldingLineup) {
            const updated = { ...selectedPlayers };

            for (const pos of positions) {
                updated[pos.key] = fieldingLineup[pos.key]?.id || null;
            }

            setSelectedPlayers(updated);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldingLineup]);

    /*
     * Select a player
     */
    const handleSelect = (posKey: TeamLineupPosition, playerId: string) => {
        setSelectedPlayers((prev) => ({
            ...prev,
            [posKey]: playerId === "none" || playerId === "" ? null : playerId,
        }));
    };

    /*
     * Clear lineup
     */
    const clearLineup = () => {
        setSelectedPlayers({
            P: null,
            C: null,
            "1B": null,
            "2B": null,
            "3B": null,
            SS: null,
            LF: null,
            CF: null,
            RF: null,
        });
    };

    /*
     * Save lineup
     */
    const handleSave = async () => {
        const supabase = createClient();

        const { data: user } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to save a lineup");
            return;
        }

        const token = (await supabase.auth.getSession()).data.session
            ?.access_token;

        if (!token) {
            toast.error("You must be logged in to save a lineup");
            return;
        }

        await saveLineup(selectedPlayers, token);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: async () => await handleSave(),

        onSuccess: () => {
            toast("Lineup saved successfully!");
        },

        onError: (error) => console.error("Error saving lineup:", error),
    });

    /*
     * Player statistics tooltip
     */
    const getPlayerStats = (playerId: string) => {
        const player = roster.find((p) => p.id === playerId);

        if (!player) return null;

        const stats = player.stats;

        return (
            <div className="bg-white text-gray-900 rounded-xl p-4 w-64 shadow-2xl border border-gray-200">
                {/* Player Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    {player.image ? (
                        <img
                            src={player.image}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">?</span>
                        </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="font-bold text-base truncate">
                            {player.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                            {player.position ?? "Player"}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div>
                        {/* Batting */}
                        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                            Batting
                        </h4>

                        <div className="grid grid-cols-3 gap-2">
                            <ActualStat
                                label="AVG"
                                value={
                                    stats.battingAverage != null
                                        ? stats.battingAverage.toFixed(3)
                                        : "-"
                                }
                            />

                            <ActualStat
                                label="HR"
                                value={stats.homeRuns ?? "-"}
                            />

                            <ActualStat label="RBI" value={stats.rbis ?? "-"} />

                            <ActualStat label="H" value={stats.hits ?? "-"} />

                            <ActualStat label="R" value={stats.runs ?? "-"} />
                        </div>

                        {/* Pitching */}
                        {(stats.era != null ||
                            stats.strikeouts != null ||
                            stats.inningsPitched != null) && (
                            <>
                                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-4 mb-2">
                                    Pitching
                                </h4>

                                <div className="grid grid-cols-3 gap-2">
                                    <ActualStat
                                        label="ERA"
                                        value={
                                            stats.era != null
                                                ? stats.era.toFixed(2)
                                                : "-"
                                        }
                                    />

                                    <ActualStat
                                        label="SO"
                                        value={stats.strikeouts ?? "-"}
                                    />

                                    <ActualStat
                                        label="IP"
                                        value={stats.inningsPitched ?? "-"}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /*
     * Individual stat box
     */
    const ActualStat = ({
        label,
        value,
    }: {
        label: string;
        value: string | number;
    }) => (
        <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-500">
                {label}
            </div>

            <div className="text-sm font-bold text-gray-900 mt-0.5">
                {value}
            </div>
        </div>
    );

    /*
     * Tooltip positioning
     */
    const getTooltipStyle = () => {
        if (!hoveredPlayer) return {};

        const { position, top, left } = hoveredPlayer;

        /*
         * Outfield players:
         *
         * LF -> below/right
         * CF -> directly below
         * RF -> below/left
         */
        if (position === "LF") {
            return {
                top: `calc(${top} + 40px)`,
                left,
                transform: "translate(0, 0)",
            };
        }

        if (position === "RF") {
            return {
                top: `calc(${top} + 40px)`,
                left,
                transform: "translate(-100%, 0)",
            };
        }

        if (position === "CF") {
            return {
                top: `calc(${top} + 40px)`,
                left,
                transform: "translate(-50%, 0)",
            };
        }

        /*
         * Catcher is near the bottom of the field,
         * so put the tooltip above it.
         */
        return {
            top,
            left,
            transform: "translate(-50%, calc(-100% - 40px))",
        };
    };

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-6">
            <div className="flex flex-col md:flex-row items-start justify-center gap-10">
                {/* =========================
                    FIELD
                ========================= */}

                <div className="relative shrink-0">
                    <img
                        src="/images/field.png"
                        alt="Field"
                        width={700}
                        height={500}
                        className="rounded-xl shadow border border-gray-300"
                    />

                    {/* =========================
                        PLAYER POSITIONS
                    ========================= */}

                    {positions.map((pos) => {
                        const selectedId = selectedPlayers[pos.key];

                        const player = roster.find((p) => p.id === selectedId);

                        const isHovered =
                            player && hoveredPlayer?.playerId === player.id;

                        return (
                            <div
                                key={pos.key}
                                className="absolute z-10"
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: "translate(-50%, -50%)",
                                }}
                                onMouseEnter={() => {
                                    if (player) {
                                        setHoveredPlayer({
                                            playerId: player.id,
                                            top: pos.top,
                                            left: pos.left,
                                            position: pos.key,
                                        });
                                    }
                                }}
                                onMouseLeave={() => setHoveredPlayer(null)}
                            >
                                <div className="relative">
                                    {/* PLAYER CIRCLE */}

                                    <div
                                        className={`
                                            w-12
                                            h-12
                                            rounded-full
                                            flex
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            transition-all
                                            duration-200
                                            ${
                                                player
                                                    ? `border-2 ${
                                                          isHovered
                                                              ? "scale-125 border-yellow-400 shadow-lg"
                                                              : "border-white"
                                                      }`
                                                    : "border-2 border-dashed border-white/80 bg-black/30"
                                            }
                                        `}
                                    >
                                        {player ? (
                                            <img
                                                src={
                                                    player.image ||
                                                    "/default-image.jpg"
                                                }
                                                alt={player.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white/80 text-xl font-light">
                                                +
                                            </span>
                                        )}
                                    </div>

                                    {/* POSITION BADGE */}

                                    <div
                                        className="
                                            absolute
                                            -top-2
                                            -right-2
                                            z-20
                                            min-w-[22px]
                                            h-[22px]
                                            px-1
                                            flex
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-violet-700
                                            border-2
                                            border-white
                                            text-white
                                            text-[10px]
                                            font-bold
                                            shadow-md
                                        "
                                    >
                                        {pos.key}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* =========================
                        PLAYER STATS TOOLTIP
                    ========================= */}

                    {hoveredPlayer && (
                        <div
                            className="
                                absolute
                                z-50
                                pointer-events-none
                                transition-all
                                duration-200
                            "
                            style={getTooltipStyle()}
                        >
                            {getPlayerStats(hoveredPlayer.playerId)}
                        </div>
                    )}
                </div>

                {/* =========================
                    LINEUP SELECTOR
                ========================= */}

                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 w-full max-w-sm">
                    <h2 className="text-2xl font-bold text-violet-700 mb-1">
                        Team Lineup
                    </h2>

                    <p className="text-sm text-gray-500 mb-5">
                        Assign a player to each defensive position.
                    </p>

                    {positions.map((pos) => {
                        const selectedId = selectedPlayers[pos.key];

                        const selectedPlayer = roster.find(
                            (p) => p.id === selectedId,
                        );

                        /*
                         * Don't allow the same player
                         * to occupy multiple positions.
                         */
                        const availablePlayers = roster.filter(
                            (p) =>
                                !Object.entries(selectedPlayers).some(
                                    ([key, id]) =>
                                        id === p.id && key !== pos.key,
                                ),
                        );

                        return (
                            <div key={pos.key} className="mb-3">
                                {/* Position Label */}

                                <label className="flex items-center gap-2 mb-1 font-medium text-violet-800">
                                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                                        {pos.key}
                                    </span>

                                    {pos.label}
                                </label>

                                <Select
                                    value={selectedId ?? "none"}
                                    onValueChange={(value) =>
                                        handleSelect(pos.key, value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Player">
                                            {selectedPlayer ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={
                                                            selectedPlayer.image ||
                                                            "/default-image.jpg"
                                                        }
                                                        alt={
                                                            selectedPlayer.name
                                                        }
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />

                                                    <span>
                                                        {selectedPlayer.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">
                                                    Select Player
                                                </span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {/* Clear Position */}

                                        <SelectItem
                                            value="none"
                                            className="text-gray-500"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                                                    <span className="text-gray-400 text-sm">
                                                        +
                                                    </span>
                                                </div>

                                                <span>Select Player</span>
                                            </div>
                                        </SelectItem>

                                        {/* Players */}

                                        {availablePlayers.map((player) => (
                                            <SelectItem
                                                key={player.id}
                                                value={player.id}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Player Face */}

                                                    <img
                                                        src={
                                                            player.image ||
                                                            "/default-image.jpg"
                                                        }
                                                        alt={player.name}
                                                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                    />

                                                    {/* Player Info */}

                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {player.name}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            AVG{" "}
                                                            {player.stats?.battingAverage?.toFixed(
                                                                3,
                                                            ) ?? "N/A"}{" "}
                                                            • HR{" "}
                                                            {player.stats
                                                                ?.homeRuns ??
                                                                "N/A"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        );
                    })}

                    {/* =========================
                        BUTTONS
                    ========================= */}

                    <div className="mt-6 flex justify-between gap-3">
                        <button
                            onClick={() => mutate()}
                            disabled={isPending}
                            className="
                                flex-1
                                bg-blue-600
                                hover:bg-blue-700
                                disabled:bg-blue-400
                                text-white
                                px-4
                                py-2
                                rounded-lg
                                shadow
                                transition
                            "
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                "Save Lineup"
                            )}
                        </button>

                        <button
                            onClick={clearLineup}
                            className="
                                flex-1
                                bg-red-600
                                hover:bg-red-700
                                text-white
                                px-4
                                py-2
                                rounded-lg
                                shadow
                                transition
                            "
                        >
                            Clear Lineup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
