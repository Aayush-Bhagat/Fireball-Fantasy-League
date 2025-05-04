"use client";
import React, { useState } from "react";
import NavBar from "@/components/navBar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PlayerCard from "@/components/playerCard"; // import your player card here

const topBatters = [
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

const teams = [
    {
        team: "Phoenix Firebirds",
        logo: "https://cdn.discordapp.com/avatars/154678519559880704/f51b4ffe13d9565de09cb62e96d9e6c9.webp?size=240",
    },
    {
        team: "Denver Devils",
        logo: "https://cdn.discordapp.com/avatars/211450221270532096/2d82db96edc8a353f40a1bcce4c5ca51.webp?size=240",
    },
    {
        team: "Orlando Lynx",
        logo: "https://cdn.discordapp.com/avatars/296397828706795529/a001d16fdd8d613bc5e6c54ed210f1b4.webp?size=240",
    },
    {
        team: "Seattle Storm",
        logo: "https://cdn.discordapp.com/avatars/155399049288220673/b6261f79039b870e5f6324cf304dbf45.webp?size=240",
    },
    {
        team: "Boston Titans",
        logo: "https://cdn.discordapp.com/avatars/222243857402822658/f359ddab179ade1c5100474ae4da838f.webp?size=240",
    },
    {
        team: "Chicago Wolves",
        logo: "https://cdn.discordapp.com/avatars/154677629021061120/da633cd609f3a03c3626e0c733cd8406.webp?size=240",
    },
    {
        team: "Miami Sharks",
        logo: "https://media3.giphy.com/media/TeSYVrvuBbt8A/200w.gif?cid=6c09b952y0osty53z4v94sw6e79ybrjnyg9i5svqxq9xz4rg&ep=v1_gifs_search&rid=200w.gif&ct=g",
    },
    {
        team: "Toronto Thunder",
        logo: "https://cdn.discordapp.com/avatars/234443334578470913/6e6650c277dc6b95b5b809babba89771.webp?size=240",
    },
];

export default function ViewAllPlayers() {
    const router = useRouter();
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showCard, setShowCard] = useState(false);

    function getLogo(teamName: string) {
        return teams.find((team) => team.team === teamName)?.logo || "";
    }

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

                {/* Header */}
                <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-4">
                    <h1 className="text-3xl font-bold text-blue-900">
                        All Players
                    </h1>
                </div>

                {/* Table */}
                <div className="px-6 flex justify-center">
                    <div className="w-full max-w-6xl">
                        <div className="overflow-x-auto shadow-lg rounded-lg bg-white border border-gray-200">
                            <table className="w-full table-auto text-left">
                                <thead className="bg-blue-50 text-blue-800">
                                    <tr>
                                        <th className="px-6 py-3">Player</th>
                                        <th className="px-6 py-3">Team</th>
                                        <th className="px-6 py-3">AVG</th>
                                        <th className="px-6 py-3">HR</th>
                                        <th className="px-6 py-3">RBI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {topBatters.map((player, index) => (
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={getLogo(
                                                            player.team
                                                        )}
                                                        alt={`${player.team} logo`}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span>{player.team}</span>
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
