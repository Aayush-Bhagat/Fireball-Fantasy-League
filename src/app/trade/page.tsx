"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
    id: number;
    name: string;
    image?: string;
};

type Team = {
    id: number;
    name: string;
    players: Player[];
};

const yourTeam: Player[] = [
    {
        id: 1,
        name: "Mario",
        image: "https://mario.wiki.gallery/images/e/e4/MSS_Mario_Character_Select_Sprite.png",
    },
    {
        id: 2,
        name: "Luigi",
        image: "https://mario.wiki.gallery/images/5/50/MSS_Luigi_Character_Select_Sprite_1.png",
    },
    {
        id: 3,
        name: "Yoshi",
        image: "https://mario.wiki.gallery/images/5/5b/MSS_Yoshi_Character_Select_Sprite.png",
    },
    {
        id: 4,
        name: "Bowser",
        image: "https://mario.wiki.gallery/images/5/5e/MSS_Bowser_Character_Select_Sprite.png",
    },
];

const otherTeams: Team[] = [
    {
        id: 1,
        name: "Mushroom Kings",
        players: yourTeam,
    },
    {
        id: 2,
        name: "Koopa Crushers",
        players: yourTeam,
    },
];

export default function TradeScreen() {
    const router = useRouter();
    const [selectedYourPlayers, setSelectedYourPlayers] = useState<number[]>(
        []
    );
    const [selectedOtherPlayers, setSelectedOtherPlayers] = useState<number[]>(
        []
    );
    const [selectedTeamId, setSelectedTeamId] = useState<number>(
        otherTeams[0].id
    );

    const selectedTeam = otherTeams.find((team) => team.id === selectedTeamId)!;

    const toggleSelection = (
        id: number,
        selected: number[],
        setSelected: React.Dispatch<React.SetStateAction<number[]>>
    ) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const handleSendTrade = () => {
        const yourSelected = yourTeam.filter((p) =>
            selectedYourPlayers.includes(p.id)
        );
        const otherSelected = selectedTeam.players.filter((p) =>
            selectedOtherPlayers.includes(p.id)
        );

        alert(
            `You offered: ${yourSelected.map((p) => p.name).join(", ")}\n` +
                `In exchange for: ${otherSelected
                    .map((p) => p.name)
                    .join(", ")}\n` +
                `From team: ${selectedTeam.name}`
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 bg-white rounded-xl shadow-md space-y-6 mt-10">
            <h2 className="text-4xl font-bold text-center text-purple-700">
                Propose Trade
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Your Team */}
                <div className="w-full md:w-1/2 border p-4 rounded-lg bg-green-50">
                    <h3 className="text-2xl font-semibold text-green-700 mb-4">
                        Your Team
                    </h3>
                    <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {yourTeam.map((player) => (
                            <li
                                key={player.id}
                                onClick={() =>
                                    toggleSelection(
                                        player.id,
                                        selectedYourPlayers,
                                        setSelectedYourPlayers
                                    )
                                }
                                className={`flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-103 cursor-pointer ${
                                    selectedYourPlayers.includes(player.id)
                                        ? "bg-green-200"
                                        : "bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        className="h-12 w-12 object-contain transform -scale-x-100"
                                    />
                                    <span className="text-lg">
                                        {player.name}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedYourPlayers.includes(
                                        player.id
                                    )}
                                    readOnly
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Other Team */}
                <div className="w-full md:w-1/2 border p-4 rounded-lg bg-orange-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-orange-700">
                            Trade With
                        </h3>
                        <select
                            value={selectedTeamId}
                            onChange={(e) => {
                                setSelectedTeamId(Number(e.target.value));
                                setSelectedOtherPlayers([]);
                            }}
                            className="border rounded px-2 py-1 bg-white"
                        >
                            {otherTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedTeam.players.map((player) => (
                            <div
                                key={player.id}
                                onClick={() =>
                                    toggleSelection(
                                        player.id,
                                        selectedOtherPlayers,
                                        setSelectedOtherPlayers
                                    )
                                }
                                className={`flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-103 cursor-pointer ${
                                    selectedOtherPlayers.includes(player.id)
                                        ? "bg-orange-200"
                                        : "bg-white"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        className="h-12 w-12 object-contain"
                                    />
                                    <span className="text-lg">
                                        {player.name}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedOtherPlayers.includes(
                                        player.id
                                    )}
                                    readOnly
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
                <button
                    className="px-5 py-2 rounded border text-gray-700 hover:bg-gray-100"
                    onClick={() => router.back()}
                >
                    Cancel
                </button>
                <button
                    className="px-5 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                    onClick={handleSendTrade}
                >
                    Send Trade
                </button>
            </div>
        </div>
    );
}
