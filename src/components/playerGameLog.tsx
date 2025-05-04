import React from "react";
import { getPlayerGameLogs } from "@/requests/players";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
type Props = {
    player: string;
};
export default function PlayerGameLog({ player }: Props) {
    const { data: playerGameLogs, isLoading } = useQuery({
        queryKey: ["player-game-logs", player],
        queryFn: async () => {
            const res = await getPlayerGameLogs(player);
            return res.games;
        },
    });
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Recent Game Log</h2>
            <div className="overflow-x-auto rounded-lg">
                <table className="w-full table-fixed bg-white border border-gray-100 shadow  text-sm">
                    {isLoading && <Loader2 className="animate-spin" />}

                    <thead className="bg-purple-600 text-white">
                        <tr>
                            <th className="p-2">Date</th>
                            <th className="p-2">Opponent</th>
                            <th className="p-2">AB</th>
                            <th className="p-2">H</th>
                            <th className="p-2">HR</th>
                            <th className="p-2">RBI</th>
                            <th className="p-2">R</th>
                            <th className="p-2">AVG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerGameLogs &&
                            playerGameLogs.map((game, i) => (
                                <tr
                                    key={i}
                                    className="even:bg-gray-50 text-center"
                                >
                                    <td className="p-2 whitespace-nowrap">
                                        {(game.playedAt &&
                                            format(
                                                new Date(game.playedAt),
                                                "MM/dd"
                                            )) ||
                                            "TBD"}{" "}
                                    </td>
                                    <td className="p-2">
                                        {game.opponent.abbreviation}
                                    </td>
                                    <td className="p-2">{game.stats.atBats}</td>
                                    <td className="p-2">{game.stats.hits}</td>
                                    <td className="p-2">
                                        {game.stats.homeRuns}
                                    </td>
                                    <td className="p-2">{game.stats.rbis}</td>
                                    <td className="p-2">{game.stats.runs}</td>
                                    <td className="p-2">
                                        {game.stats.battingAverage}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
