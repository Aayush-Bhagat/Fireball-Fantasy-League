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
    TeamWithKeepsDto,
    TeamLineupPosition,
} from "@/dtos/teamDtos";
import { Progress } from "@/components/ui/progress";
import { saveLineup } from "@/requests/lineup";
import { toast } from "sonner";

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
    teamData: TeamWithKeepsDto;
    token: string;
}

export default function EditLineup({
    lineupData,
    rosterData,
    teamData,
    token,
}: Props) {
    const [selectedPlayers, setSelectedPlayers] = useState<{
        [key in TeamLineupPosition]: string | null;
    }>({
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

    const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

    const handleSelect = (posKey: TeamLineupPosition, playerId: string) => {
        setSelectedPlayers((prev) => ({ ...prev, [posKey]: playerId }));
    };

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

    const { fieldingLineup } = use(lineupData);
    const { roster } = use(rosterData);

    const handleHover = (playerId: string) => {
        setHoveredPlayer(playerId);
    };

    const handleHoverOut = () => {
        setHoveredPlayer(null);
    };

    const handleSave = () => {
        saveLineup(selectedPlayers, token)
            .then(() => {
                toast("Lineup saved successfully!", {
                    description: "Your lineup has been saved.",
                });
            })
            .catch((error) => {
                console.error("Error saving lineup:", error);
            });
    };
    const getPlayerStats = (playerId: string) => {
        const player = roster.find((p) => p.id === playerId);

        if (!player) return null;
        const batting = player.batting;
        const fielding = player.fielding;
        const pitching = player.pitching;
        const running = player.running;
        return (
            <div className="text-white bg-black p-3 rounded-lg shadow-lg">
                <h3 className="font-semibold">{player.name}</h3>
                <div className="flex items-center ">
                    <img
                        src={"/images/battingIcon.png"}
                        alt="Batting Icon"
                        className="w-8 h-8"
                    />
                    <Progress
                        value={batting * 10}
                        max={100}
                        className="w-48 h-2  rounded-lg"
                    />
                    {batting}
                </div>
                <div className="flex items-center  mt-4">
                    <img
                        src={"/images/fieldingIcon.png"}
                        alt="Fielding Icon"
                        className="w-8 h-8"
                    />
                    <Progress
                        value={fielding * 10}
                        max={100}
                        className="w-48 h-2   rounded-lg"
                    />
                    {fielding}
                </div>
                <div className="flex items-center  mt-4">
                    <img
                        src={"/images/pitchingIcon.png"}
                        alt="Pitching Icon"
                        className="w-8 h-8"
                    />
                    <Progress
                        value={pitching * 10}
                        max={100}
                        className="w-48 h-2 rounded-lg"
                    />
                    {pitching}
                </div>
                <div className="flex items-center  mt-4">
                    <img
                        src={"/images/runningIcon.png"}
                        alt="Running Icon"
                        className="w-8 h-8"
                    />
                    <Progress
                        value={running * 10}
                        max={100}
                        className="w-48 h-2   rounded-lg"
                    />
                    {running}
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (fieldingLineup) {
            setSelectedPlayers((prev) => {
                const updated = { ...prev };
                for (const pos of positions) {
                    const player = fieldingLineup[pos.key];
                    updated[pos.key] = player?.id || null;
                }
                return updated;
            });
        }
    }, [fieldingLineup]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pt-6 px-6">
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
                        const selectedId = selectedPlayers[pos.key];
                        const player =
                            roster.find((p) => p.id === selectedId) ||
                            fieldingLineup[pos.key];

                        // Handle player being null or missing image
                        const playerImage =
                            player?.image || "/default-image.jpg"; // Fallback to default image

                        const isHovered = hoveredPlayer === player?.id;

                        return player ? (
                            <div
                                key={pos.key}
                                className={`absolute transition-transform duration-300 hover:scale-110 ${
                                    isHovered
                                        ? "scale-125 border-4 border-yellow-500"
                                        : ""
                                }`}
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: "translate(-50%, -50%)",
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    border: "2px solid white",
                                }}
                                onMouseEnter={() => handleHover(player.id)}
                                onMouseLeave={handleHoverOut}
                            >
                                <img
                                    src={playerImage}
                                    alt={player.name}
                                    className="rounded-full"
                                />
                                {isHovered && (
                                    <div
                                        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-48"
                                        style={{
                                            zIndex: 10,
                                        }}
                                    >
                                        {getPlayerStats(player.id)}
                                    </div>
                                )}
                            </div>
                        ) : null;
                    })}
                </div>

                <div className="flex flex-col gap-4 bg-white shadow-lg rounded-xl p-6 w-full max-w-sm border border-gray-200">
                    <h2 className="text-2xl font-semibold text-violet-700 mb-2">
                        Team Lineup
                    </h2>
                    {positions.map((pos) => {
                        const selectedId = selectedPlayers[pos.key];
                        const player =
                            roster.find((p) => p.id === selectedId) ||
                            fieldingLineup[pos.key];

                        // Only show players not already selected, or currently selected by this position
                        const availablePlayers = roster.filter(
                            (p) =>
                                !Object.entries(selectedPlayers).some(
                                    ([key, id]) =>
                                        id === p.id && key !== pos.key
                                )
                        );

                        return (
                            <div key={pos.key} className="flex flex-col gap-1">
                                <label className="text-violet-800 font-medium">
                                    {pos.label}
                                </label>
                                <Select
                                    value={selectedPlayers[pos.key] || "none"}
                                    onValueChange={(value) =>
                                        handleSelect(
                                            pos.key,
                                            value === "none" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select Player" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="none"
                                            className="text-gray-500"
                                        >
                                            Select Player
                                        </SelectItem>
                                        {availablePlayers.map((player) => (
                                            <SelectItem
                                                key={player.id}
                                                value={player.id}
                                            >
                                                {player.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        );
                    })}
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                            onClick={handleSave}
                        >
                            Save Lineup
                        </button>
                        <button
                            onClick={clearLineup}
                            className="bg-red-700 text-white py-2 px-6 rounded-lg shadow hover:bg-red-800 transition duration-200"
                        >
                            Clear Board
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
