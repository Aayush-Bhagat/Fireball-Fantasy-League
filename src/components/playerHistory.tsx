import React from "react";
import { getPlayerHistory } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Props = {
    player: string;
};
export default function PlayerHistory({ player }: Props) {
    const { data: playerHistory, isLoading } = useQuery({
        queryKey: ["player-history", player],
        queryFn: async () => {
            const res = await getPlayerHistory(player);
            return res.history;
        },
    });
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Player History</h2>
            {isLoading && (
                <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin text-3xl" />
                </div>
            )}

            <div className="flex flex-col gap-2 overflow-y-auto">
                {playerHistory &&
                    playerHistory
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                        .map((history, i) => (
                            <div
                                key={i}
                                className="w-full table-auto bg-white border border-gray-200 shadow rounded-lg text-sm p-3"
                            >
                                {history.type === "Draft" ? (
                                    <p>
                                        <strong>Drafted</strong> by{" "}
                                        <span className="font-medium">
                                            {history.team.name}
                                        </span>{" "}
                                        in{" "}
                                        <span className="font-medium">
                                            Round {history.draftRound}
                                        </span>{" "}
                                        with pick{" "}
                                        <span className="font-medium">
                                            {history.draftPick}
                                        </span>{" "}
                                        —{" "}
                                        <span className="text-gray-500">
                                            {format(
                                                new Date(history.createdAt),
                                                "MMMM d, yyyy"
                                            )}
                                        </span>
                                    </p>
                                ) : (
                                    <p>
                                        <strong>Traded</strong> to{" "}
                                        <span className="font-medium">
                                            {history.team.name}
                                        </span>{" "}
                                        —{" "}
                                        <span className="text-gray-500">
                                            {format(
                                                new Date(history.createdAt),
                                                "MMMM d, yyyy"
                                            )}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ))}
            </div>
        </div>
    );
}
