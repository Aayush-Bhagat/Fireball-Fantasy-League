import React from "react";
import { getPlayerHistory } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
type Props = {
    player: string;
};
export default function playerHistory({ player }: Props) {
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
            {isLoading && <Loader2 className="animate-spin" />}

            <div className="w-full table-auto bg-white border border-gray-100 shadow rounded-lg text-sm">
                <span className="p-2 block">
                    {playerHistory &&
                        playerHistory.map((history, i) => (
                            <div key={i}>
                                {history.type === "Draft" ? (
                                    <div className="p-2">
                                        Drafted by {history.team.name} with pick{" "}
                                        {history.draftPick} in round{" "}
                                        {history.draftRound}
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        Traded to {history.team.name}{" "}
                                    </div>
                                )}
                            </div>
                        ))}
                </span>
            </div>
        </div>
    );
}
