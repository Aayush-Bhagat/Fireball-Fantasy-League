import React from "react";
import { viewFreeAgents } from "@/requests/players";
import ViewPlayers from "@/components/viewPlayers";

export default async function page() {
	const { players } = await viewFreeAgents();

	return (
		<div>
			<div>
				<ViewPlayers players={players} freeAgents={true} />
			</div>
		</div>
	);
}
