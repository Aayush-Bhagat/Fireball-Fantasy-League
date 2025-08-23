import React from "react";
import { getPlayerAwards } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
type Props = {
    player: string;
};
export default function PlayerAwards({ player }: Props) {
    const { data: playerAwards, isLoading } = useQuery({
        queryKey: ["player-awards", player],
        queryFn: async () => {
            const res = await getPlayerAwards(player);
            return res.awards;
        },
    });
    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">🏆 Player Awards</h2>

            {isLoading && (
                <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin text-3xl text-gray-500" />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
                {playerAwards &&
                    playerAwards.map((award, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-200 shadow rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition"
                        >
                            {/* Icon with Win Count Badge */}
                            <div className="relative">
                                {award.icon && (
                                    <img
                                        src={award.icon}
                                        alt={award.name}
                                        className="w-25 h-25 mb-3 rounded-md object-contain"
                                    />
                                )}
                                {/* Badge in top-right corner */}
                                {award.wins?.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                        x{award.wins.length}
                                    </span>
                                )}
                            </div>

                            {/* Award Name */}
                            <span className="text-base font-semibold">
                                {award.name}
                            </span>

                            {/* Seasons */}
                            {award.wins?.length > 0 && (
                                <div className="mt-2 text-sm text-gray-500">
                                    <span className="block font-medium">
                                        Seasons:
                                    </span>
                                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                                        {award.wins.map((w) => (
                                            <span
                                                key={w.seasonId}
                                                className="px-2 py-1 bg-gray-100 rounded-md text-xs"
                                            >
                                                {w.seasonId}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
