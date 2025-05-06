"use client";
import React, { useState } from "react";
import NavBar from "@/components/navBar";
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
        players: [
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
        ],
    },
    {
        id: 2,
        name: "Koopa Crushers",
        players: [
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
        ],
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
        setSelected((prev: number[]) =>
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
        <>
            <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mt-20">
                <h2 className="text-3xl font-bold text-center text-purple-700">
                    Propose Trade
                </h2>

                {/* Team Trade Section */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Your Team */}
                    <div className="w-full md:w-1/2 border p-4 rounded-md bg-green-50">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">
                            Your Team
                        </h3>
                        <ul className="space-y-2">
                            {yourTeam.map((player) => (
                                <li
                                    key={player.id}
                                    className="flex justify-between items-center border p-2 rounded bg-white"
                                >
                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                    <span>{player.name}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedYourPlayers.includes(
                                            player.id
                                        )}
                                        onChange={() =>
                                            toggleSelection(
                                                player.id,
                                                selectedYourPlayers,
                                                setSelectedYourPlayers
                                            )
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Other Team */}
                    <div className="w-full md:w-1/2 border p-4 rounded-md bg-orange-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-orange-700">
                                Trade With
                            </h3>
                            <select
                                value={selectedTeamId}
                                onChange={(e) => {
                                    setSelectedTeamId(Number(e.target.value));
                                    setSelectedOtherPlayers([]); // clear selection
                                }}
                                className="border rounded p-1 bg-white"
                            >
                                {otherTeams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className=" overflow-y-auto space-y-2">
                            {selectedTeam.players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex justify-between items-center border p-2 rounded bg-white"
                                >
                                    <img src={player.image} alt={player.name} />
                                    <span>{player.name}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedOtherPlayers.includes(
                                            player.id
                                        )}
                                        onChange={() =>
                                            toggleSelection(
                                                player.id,
                                                selectedOtherPlayers,
                                                setSelectedOtherPlayers
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 rounded border hover:bg-gray-100"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                        onClick={handleSendTrade}
                    >
                        Send Trade
                    </button>
                </div>
            </div>
        </>
    );
}
