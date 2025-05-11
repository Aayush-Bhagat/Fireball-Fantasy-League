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
            <div className="text-white bg-black p-3 rounded-lg shadow-lg w-60">
                <h3 className="font-semibold mb-2 text-center">
                    {player.name}
                </h3>
                <StatRow icon="/images/battingIcon.png" value={batting} />
                <StatRow icon="/images/fieldingIcon.png" value={fielding} />
                <StatRow icon="/images/pitchingIcon.png" value={pitching} />
                <StatRow icon="/images/runningIcon.png" value={running} />
            </div>
        );
    };

    const StatRow = ({ icon, value }: { icon: string; value: number }) => (
        <div className="flex items-center mt-2">
            <img src={icon} alt="Stat Icon" className="w-6 h-6 mr-2" />
            <Progress
                value={value * 10}
                max={100}
                className="w-full h-2 rounded-lg"
            />
            <span className="ml-2 text-sm">{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen pt-6 px-6">
            <div className="flex flex-col md:flex-row gap-10 justify-center items-start">
                <div className="relative">
                    <img
                        src="/images/field.png"
                        alt="Field"
                        height={500}
                        width={700}
                        className="rounded-xl shadow-md border border-violet-300"
                    />
                    {positions.map((pos) => {
                        const player = roster.find(
                            (p) => p.id === fieldingLineup[pos.key]?.id
                        );

                        if (!player) return null;

                        const isHovered = hoveredPlayer === player.id;
                        const playerImage =
                            player.image || "/default-image.jpg";

                        return (
                            <div
                                key={pos.key}
                                className="absolute"
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: "translate(-50%, -50%)",
                                    zIndex: isHovered ? 30 : 10,
                                }}
                                onMouseEnter={() => setHoveredPlayer(player.id)}
                                onMouseLeave={() => setHoveredPlayer(null)}
                            >
                                {isHovered && (
                                    <div className="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 z-40">
                                        {getPlayerStats(player.id)}
                                    </div>
                                )}
                                <img
                                    src={playerImage}
                                    alt={player.name}
                                    className={`w-12 h-12 rounded-full border-2 transition-transform duration-200 ${
                                        isHovered
                                            ? "scale-125 border-yellow-400"
                                            : "border-white"
                                    }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
