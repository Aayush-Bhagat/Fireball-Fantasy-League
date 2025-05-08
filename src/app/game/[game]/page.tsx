import React from "react";
import BoxScore from "@/components/boxScore";
import { getGameStats } from "@/requests/games";
export default async function page({
    params,
}: {
    params: Promise<{ game: string }>;
}) {
    const { game } = await params;
    console.log("game", game);
    const boxScore = getGameStats(game);
    return (
        <div className="pt-16">
            <BoxScore boxScore={boxScore} />
        </div>
    );
}
