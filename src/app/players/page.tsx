import React from "react";
import ViewPlayers from "@/components/viewPlayers";
import { viewAllPlayers } from "@/requests/players";

export default async function ViewAllPlayers() {
	const { players } = await viewAllPlayers();

	return (
		<>
			<ViewPlayers players={players} />
		</>
	);
}
