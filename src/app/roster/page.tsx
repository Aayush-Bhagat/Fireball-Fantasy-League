"use client";
import React, { useState } from "react";
import NavBar from "@/components/navBar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PlayerCard from "@/components/playerCard"; // import your player card here

const myRoster = [
    {
        name: "Bowser",
        team: "Phoenix Firebirds",
        hr: 34,
        rbi: 98,
        avg: 0.312,
        image: "https://mario.wiki.gallery/images/5/5e/MSS_Bowser_Character_Select_Sprite.png",
    },
    {
        name: "Mario",
        team: "Denver Devils",
        hr: 41,
        rbi: 109,
        avg: 0.299,
        image: "https://mario.wiki.gallery/images/e/e4/MSS_Mario_Character_Select_Sprite.png",
    },
    {
        name: "Luigi",
        team: "Orlando Lynx",
        hr: 27,
        rbi: 85,
        avg: 0.321,
        image: "https://mario.wiki.gallery/images/5/50/MSS_Luigi_Character_Select_Sprite_1.png",
    },
    {
        name: "Yoshi",
        team: "Seattle Storm",
        hr: 22,
        rbi: 74,
        avg: 0.337,
        image: "https://mario.wiki.gallery/images/5/5b/MSS_Yoshi_Character_Select_Sprite.png",
    },
];

export default function Roster() {
    const router = useRouter();
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showCard, setShowCard] = useState(false);

    const handlePlayerClick = (player: any) => {
        setSelectedPlayer(player);
        setShowCard(true);
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-100 font-sans pt-20">
                {/* Modal */}
                {showCard && selectedPlayer && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="relative">
                            <PlayerCard player={selectedPlayer} />
                            <button
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8"
                                onClick={() => setShowCard(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Team Info */}
                <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://cdn.discordapp.com/avatars/296397828706795529/a001d16fdd8d613bc5e6c54ed210f1b4.webp?size=240"
                            alt="Team Logo"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <h1 className="text-3xl font-bold text-blue-900">
                            Orlando Lynx
                        </h1>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => router.push("/editLineup")}
                    >
                        Edit Lineup
                    </Button>
                    <Button
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => router.push("/trade")}
                    >
                        Trade
                    </Button>
                </div>

                {/* Roster Table */}
                <div className="px-6 flex justify-center">
                    <div className="w-full max-w-6xl">
                        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                            Team Lineup
                        </h2>
                        <div className="overflow-x-auto shadow-lg rounded-lg bg-white border border-gray-200">
                            <table className="w-full table-auto text-left">
                                <thead className="bg-blue-50 text-blue-800">
                                    <tr>
                                        <th className="px-6 py-3">Player</th>
                                        <th className="px-6 py-3">AVG</th>
                                        <th className="px-6 py-3">HR</th>
                                        <th className="px-6 py-3">RBI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {myRoster.map((player, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() =>
                                                handlePlayerClick(player)
                                            }
                                        >
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <img
                                                    src={player.image}
                                                    alt={player.name}
                                                    className="w-10 h-10 rounded-full border border-gray-300"
                                                    style={{
                                                        transform: "scaleX(-1)",
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {player.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {player.avg.toFixed(3)}
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {player.hr}
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {player.rbi}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
