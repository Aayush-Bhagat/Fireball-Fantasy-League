import { useState } from "react";
import CareerStats from "@/components/careerStats";
import PlayerGameLog from "@/components/playerGameLog";
import { BasicPlayerDto } from "@/dtos/playerDtos";
export default function CompareColumn({
    player,
}: {
    player: BasicPlayerDto | null;
}) {
    const [activeTab, setActiveTab] = useState<"career" | "gamelog">("career");

    if (!player) {
        return (
            <div className="border rounded-lg p-6 text-center text-gray-500">
                Select a player
            </div>
        );
    }

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b">
                {player.image && (
                    <img
                        src={player.image}
                        alt={player.name}
                        className="h-16 w-16 rounded-full object-contain border"
                    />
                )}
                <div>
                    <h2 className="text-xl font-bold">{player.name}</h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                <button
                    className={`flex-1 text-center py-2 font-semibold ${
                        activeTab === "career"
                            ? "text-purple-700 border-b-2 border-purple-700"
                            : "text-gray-500 hover:text-purple-700"
                    }`}
                    onClick={() => setActiveTab("career")}
                >
                    Career Stats
                </button>
                <button
                    className={`flex-1 text-center py-2 font-semibold ${
                        activeTab === "gamelog"
                            ? "text-purple-700 border-b-2 border-purple-700"
                            : "text-gray-500 hover:text-purple-700"
                    }`}
                    onClick={() => setActiveTab("gamelog")}
                >
                    Game Log
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6">
                {activeTab === "career" && <CareerStats player={player.id} />}
                {activeTab === "gamelog" && (
                    <PlayerGameLog player={player.id} />
                )}
            </div>
        </div>
    );
}
