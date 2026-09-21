"use client";

import {
    TeamLineupDto,
    TeamLineupPosition,
    TeamRosterDto,
} from "@/dtos/teamDtos";
import React, { use, useState } from "react";
import { Progress } from "@/components/ui/progress";

const positions: {
    key: TeamLineupPosition;
    label: string;
    top: string;
    left: string;
}[] = [
    { key: "P", label: "Pitcher", top: "60%", left: "50%" },
    { key: "C", label: "Catcher", top: "87%", left: "50%" },
    { key: "1B", label: "1st Base", top: "58%", left: "78%" },
    { key: "2B", label: "2nd Base", top: "40%", left: "68%" },
    { key: "3B", label: "3rd Base", top: "58%", left: "20%" },
    { key: "SS", label: "Shortstop", top: "40%", left: "30%" },
    { key: "LF", label: "Left Field", top: "20%", left: "15%" },
    { key: "CF", label: "Center Field", top: "10%", left: "50%" },
    { key: "RF", label: "Right Field", top: "20%", left: "85%" },
];

interface Props {
    lineupData: Promise<TeamLineupDto>;
    rosterData: Promise<TeamRosterDto>;
}

export default function ViewLineup({ lineupData, rosterData }: Props) {
    const { fieldingLineup } = use(lineupData);
    const { roster } = use(rosterData);

    const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

    const getPlayerStats = (playerId: string) => {
        const player = roster.find((p) => p.id === playerId);

        if (!player) return null;

        const { batting, fielding, pitching, running } = player;

        return (
            <div className="w-52 overflow-hidden rounded-lg border border-white/20 bg-black/90 shadow-xl backdrop-blur-md">
                {/* Header */}
                <div className="border-b border-white/10 bg-white/5 px-3 py-2">
                    <h3 className="truncate text-center text-sm font-bold text-white">
                        {player.name}
                    </h3>
                </div>

                {/* Stats */}
                <div className="space-y-2.5 p-3">
                    <StatRow
                        icon="/images/battingIcon.png"
                        label="Batting"
                        value={batting}
                    />

                    <StatRow
                        icon="/images/fieldingIcon.png"
                        label="Fielding"
                        value={fielding}
                    />

                    <StatRow
                        icon="/images/pitchingIcon.png"
                        label="Pitching"
                        value={pitching}
                    />

                    <StatRow
                        icon="/images/runningIcon.png"
                        label="Running"
                        value={running}
                    />
                </div>
            </div>
        );
    };

    const StatRow = ({
        icon,
        label,
        value,
    }: {
        icon: string;
        label: string;
        value: number;
    }) => (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <img src={icon} alt="" className="h-4 w-4 object-contain" />

                    <span className="text-[11px] font-medium text-white/80">
                        {label}
                    </span>
                </div>

                <span className="text-[11px] font-bold text-white">
                    {value}
                </span>
            </div>

            <Progress value={value * 10} max={100} className="h-1" />
        </div>
    );

    return (
        <div className="min-h-screen px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-5xl justify-center">
                <div className="relative w-full max-w-[700px]">
                    {/* Field glow */}
                    <div className="absolute -inset-2 rounded-2xl bg-violet-500/10 blur-xl" />

                    <div className="relative overflow-visible rounded-2xl border border-violet-300/40 bg-black/20 p-1 shadow-2xl">
                        <img
                            src="/images/field.png"
                            alt="Baseball field"
                            className="block w-full rounded-xl"
                        />

                        {positions.map((pos) => {
                            const player = roster.find(
                                (p) => p.id === fieldingLineup[pos.key]?.id,
                            );

                            if (!player) return null;

                            const isHovered = hoveredPlayer === player.id;

                            const playerImage =
                                player.image || "/default-image.jpg";

                            // Outfield players get their tooltip BELOW
                            // so it doesn't get cut off at the top.
                            const isOutfield = ["LF", "CF", "RF"].includes(
                                pos.key,
                            );

                            return (
                                <div
                                    key={pos.key}
                                    className="absolute"
                                    style={{
                                        top: pos.top,
                                        left: pos.left,
                                        transform: "translate(-50%, -50%)",
                                        zIndex: isHovered ? 50 : 10,
                                    }}
                                    onMouseEnter={() =>
                                        setHoveredPlayer(player.id)
                                    }
                                    onMouseLeave={() => setHoveredPlayer(null)}
                                >
                                    {/* Hover Stats */}
                                    {isHovered && (
                                        <div
                                            className={`absolute left-1/2 -translate-x-1/2 ${
                                                isOutfield
                                                    ? "top-[calc(100%+10px)]"
                                                    : "bottom-[calc(100%+10px)]"
                                            }`}
                                            onMouseEnter={() =>
                                                setHoveredPlayer(player.id)
                                            }
                                        >
                                            {getPlayerStats(player.id)}

                                            {/* Tooltip Arrow */}
                                            <div
                                                className={`absolute left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent ${
                                                    isOutfield
                                                        ? "bottom-full border-b-[6px] border-b-black/90"
                                                        : "top-full border-t-[6px] border-t-black/90"
                                                }`}
                                            />
                                        </div>
                                    )}

                                    {/* Player */}
                                    <div
                                        className={`flex flex-col items-center transition-all duration-200 ${
                                            isHovered
                                                ? "scale-110"
                                                : "scale-100"
                                        }`}
                                    >
                                        {/* Position */}
                                        <div
                                            className={`mb-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-md ${
                                                isHovered
                                                    ? "bg-yellow-400 text-black"
                                                    : "bg-black/75 text-white"
                                            }`}
                                        >
                                            {pos.key}
                                        </div>

                                        {/* Image */}
                                        <div
                                            className={`relative rounded-full transition-all duration-200 ${
                                                isHovered
                                                    ? "shadow-[0_0_0_2px_rgba(250,204,21,0.9),0_0_12px_rgba(250,204,21,0.45)]"
                                                    : "shadow-lg"
                                            }`}
                                        >
                                            <img
                                                src={playerImage}
                                                alt={player.name}
                                                className={`h-11 w-11 rounded-full border-2 object-cover sm:h-12 sm:w-12 ${
                                                    isHovered
                                                        ? "border-yellow-400"
                                                        : "border-white"
                                                }`}
                                            />

                                            <div
                                                className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white text-[7px] font-bold ${
                                                    isHovered
                                                        ? "bg-yellow-400 text-black"
                                                        : "bg-violet-600 text-white"
                                                }`}
                                            >
                                                {pos.key}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div
                                            className={`mt-1 max-w-[95px] truncate rounded px-1.5 py-0.5 text-center text-[11px] font-semibold shadow-md backdrop-blur-sm sm:text-xs ${
                                                isHovered
                                                    ? "bg-yellow-400 text-black"
                                                    : "bg-black/75 text-white"
                                            }`}
                                        >
                                            {player.name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
