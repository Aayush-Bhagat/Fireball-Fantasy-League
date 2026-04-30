import React from "react";
import BoxScore from "@/components/boxScore";
import { getGameStats } from "@/requests/games";
export default async function page({
	params,
}: {
	params: Promise<{ game: string }>;
}) {
	const { game } = await params;
	const boxScore = getGameStats(game);
	return (
		<div>
			<BoxScore boxScore={boxScore} />
		</div>
	);
}
