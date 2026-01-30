import React, { Suspense } from "react";
import HallOfFame from "@/components/hallOfFame";
import HallOfFameSkeleton from "@/components/hallOfFameSkeleton";
import { viewAllPlayers, getPlayerAwards, getPlayerHistory } from "@/requests/players";
import { PlayerAward } from "@/dtos/awardDtos";
import { PlayerWithStatsDto, PlayerHistoryDto } from "@/dtos/playerDtos";

export type PlayerWithAwards = {
	player: PlayerWithStatsDto;
	awards: PlayerAward[];
	history: PlayerHistoryDto[];
};

// Revalidate every 15 minutes
export const revalidate = 3 * 300;

async function HallOfFameContent() {
	// Fetch all players
	const { players } = await viewAllPlayers();

	// Fetch awards and history for all players
	const playersWithAwardsPromises = players.map(async (player) => {
		try {
			const [{ awards }, { history }] = await Promise.all([
				getPlayerAwards(player.id),
				getPlayerHistory(player.id),
			]);
			return {
				player,
				awards,
				history,
			};
		} catch (error) {
			return {
				player,
				awards: [],
				history: [],
			};
		}
	});

	const playersWithAwards = await Promise.all(playersWithAwardsPromises);

	// Filter to only include players who have at least one award
	const awardWinners = playersWithAwards.filter(
		(p) => p.awards.length > 0
	);

	return <HallOfFame playersWithAwards={awardWinners} />;
}

export default function HallOfFamePage() {
	return (
		<Suspense fallback={<HallOfFameSkeleton />}>
			<HallOfFameContent />
		</Suspense>
	);
}
