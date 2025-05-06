import React, { Suspense } from "react";
import TeamRoster from "@/components/teamRoster";
import { getTeamRoster } from "@/requests/teams";
import TeamInfo from "@/components/teamInfo";
import { getTeambyId } from "@/requests/teams";
import TeamInfoSkeleton from "@/components/loaders/TeamInfoSkeleton";
import TeamRosterSkeleton from "@/components/loaders/TeamRosterSkeleton";

export default async function Page({
	params,
}: {
	params: Promise<{ team: string }>;
}) {
	const { team } = await params;

	const roster = getTeamRoster(team);
	const teamInfo = getTeambyId(team);

	return (
		<>
			<main className="pt-20 bg-gray-100">
				<Suspense fallback={<TeamInfoSkeleton />}>
					<TeamInfo teamData={teamInfo} />
				</Suspense>
				<Suspense fallback={<TeamRosterSkeleton />}>
					<TeamRoster rosterData={roster} />
				</Suspense>
			</main>
		</>
	);
}
