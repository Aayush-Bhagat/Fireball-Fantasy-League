"use client";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import { TeamLineupDto, TeamRosterDto } from "@/dtos/teamDtos";
import { use, useState } from "react";
import { saveBattingOrder } from "@/requests/lineup";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
    rosterData: Promise<TeamRosterDto>;
    battingOrderData: Promise<TeamLineupDto>;
}
export default function BattingOrder({ rosterData, battingOrderData }: Props) {
    const supabase = createClient();
    const { roster } = use(rosterData);
    const { battingOrder } = use(battingOrderData);
    const orderedRoster = battingOrder.map((player, index) => {
        const playerInRoster = roster.find((p) => p.id === player?.id);
        if (playerInRoster) {
            return playerInRoster;
        } else {
            return roster[index];
        }
    });
    const [battingOrderD, setBattingOrder] =
        useState<PlayerWithStatsDto[]>(orderedRoster);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("index", index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        const draggedIndex = e.dataTransfer.getData("index");
        const draggedPlayer = battingOrderD[parseInt(draggedIndex)];
        const updatedOrder = [...battingOrderD];
        updatedOrder.splice(parseInt(draggedIndex), 1);
        updatedOrder.splice(targetIndex, 0, draggedPlayer);
        setBattingOrder(updatedOrder);
    };

    const handleSave = async () => {
        const { data: user } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in to save a batting order");
            return;
        }

        const token = (await supabase.auth.getSession()).data.session
            ?.access_token;

        if (!token) {
            toast.error("You must be logged in to save a batting order");
            return;
        }

        const newBattingOrder = battingOrderD.map((player) => player.id);
        await saveBattingOrder({ battingOrder: newBattingOrder }, token);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            await handleSave();
        },
        onSuccess: () => {
            toast("Batting order saved successfully!", {
                description: "Your batting order has been saved.",
            });
        },
        onError: (error) => {
            console.error(
                "Error saving batting order Refresh Page and Try Again:",
                error
            );
        },
    });

    return (
        <div className="container mx-auto mt-10 pb-20 px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
                Batting Order
            </h1>
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                <p className="text-xl text-center mb-6 text-gray-700">
                    Drag and drop players to arrange your lineup.
                </p>
                <div className="flex flex-col space-y-6">
                    {battingOrderD.map((player, index) => (
                        <div
                            key={player?.id}
                            className="p-6 bg-white border border-gray-200 rounded-lg shadow-md cursor-move hover:bg-blue-50 transition duration-200 ease-in-out"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-2xl font-bold text-blue-600 mr-4">
                                    {index + 1}
                                </span>
                                {player?.image && (
                                    <img
                                        src={player.image}
                                        alt={player.name}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                )}
                                <div className="flex flex-col space-y-1">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {player?.name}
                                    </p>
                                    {/* <p className="text-sm text-gray-500">
                                        {player.position}
                                    </p> */}
                                    <div className="text-sm text-gray-600">
                                        <span>
                                            AVG:{" "}
                                            {player?.stats?.battingAverage.toFixed(
                                                3
                                            ) ?? "N/A"}
                                        </span>{" "}
                                        |{" "}
                                        <span>
                                            HR:{" "}
                                            {player?.stats?.homeRuns ?? "N/A"}
                                        </span>{" "}
                                        |{" "}
                                        <span>
                                            RBI: {player?.stats?.rbis ?? "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => mutate()}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            "Save Batting Order"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
