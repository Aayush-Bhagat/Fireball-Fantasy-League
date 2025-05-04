"use client";
import React, { useState } from "react";
import NavBar from "@/components/navBar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const positions = [
    { key: "pitcher", label: "Pitcher", top: "60%", left: "50%" },
    { key: "catcher", label: "Catcher", top: "87%", left: "50%" },
    { key: "firstBase", label: "1st Base", top: "58%", left: "78%" },
    { key: "secondBase", label: "2nd Base", top: "40%", left: "68%" },
    { key: "thirdBase", label: "3rd Base", top: "58%", left: "20%" },
    { key: "shortstop", label: "Shortstop", top: "40%", left: "30%" },
    { key: "leftField", label: "Left Field", top: "20%", left: "15%" },
    { key: "centerField", label: "Center Field", top: "10%", left: "50%" },
    { key: "rightField", label: "Right Field", top: "20%", left: "85%" },
];

const playerList = [
    {
        id: "1",
        name: "Mario",
        image: "https://mario.wiki.gallery/images/e/e4/MSS_Mario_Character_Select_Sprite.png",
    },
    {
        id: "2",
        name: "Luigi",
        image: "https://mario.wiki.gallery/images/5/50/MSS_Luigi_Character_Select_Sprite_1.png",
    },
    {
        id: "3",
        name: "Yoshi",
        image: "https://mario.wiki.gallery/images/5/5b/MSS_Yoshi_Character_Select_Sprite.png",
    },
    {
        id: "4",
        name: "Bowser",
        image: "https://mario.wiki.gallery/images/5/5e/MSS_Bowser_Character_Select_Sprite.png",
    },
];

export default function Page() {
    const [selectedPlayers, setSelectedPlayers] = useState<{
        [key: string]: string;
    }>({});

    const handleSelect = (posKey: string, playerId: string) => {
        setSelectedPlayers((prev) => ({ ...prev, [posKey]: playerId }));
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pt-20 px-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://cdn.discordapp.com/avatars/296397828706795529/a001d16fdd8d613bc5e6c54ed210f1b4.webp?size=240"
                            alt="Team Logo"
                            className="w-16 h-16 rounded-full object-cover shadow-lg"
                        />
                        <h1 className="text-4xl font-extrabold text-violet-700 drop-shadow-sm">
                            Orlando Lynx
                        </h1>
                    </div>
                </div>

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
                            const player = playerList.find(
                                (p) => p.id === selectedPlayers[pos.key]
                            );
                            return player ? (
                                <img
                                    key={pos.key}
                                    src={player.image}
                                    alt={player.name}
                                    className="absolute   transition-transform duration-300 hover:scale-110"
                                    style={{
                                        top: pos.top,
                                        left: pos.left,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            ) : null;
                        })}
                    </div>
                    <div className="flex flex-col gap-4 bg-white shadow-lg rounded-xl p-6 w-full max-w-sm border border-gray-200">
                        <h2 className="text-2xl font-semibold text-violet-700 mb-2">
                            Team Lineup
                        </h2>
                        {positions.map((pos) => (
                            <div key={pos.key} className="flex flex-col gap-1">
                                <label className="text-violet-800 font-medium">
                                    {pos.label}
                                </label>
                                <Select
                                    value={selectedPlayers[pos.key] || ""}
                                    onValueChange={(value) =>
                                        handleSelect(pos.key, value)
                                    }
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select Player" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {playerList.map((player) => (
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
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
