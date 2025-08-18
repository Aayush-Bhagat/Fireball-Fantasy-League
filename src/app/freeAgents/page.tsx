import React from "react";
import { viewFreeAgents } from "@/requests/players";
import ViewPlayers from "@/components/viewPlayers";

export default async function page() {
    const { players } = await viewFreeAgents();

    return (
        <div>
            <h1>Free Agents</h1>
            <div>
                <ViewPlayers players={players} freeAgents={true} />
            </div>
        </div>
    );
}
