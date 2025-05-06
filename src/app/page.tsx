import StandingTable from "@/components/standingsTable";
import TeamsTable from "@/components/teamsTable";
import ScheduleTable from "@/components/scheduleTable";
import PlayerStatsTable from "@/components/playerStatsTable";
import { getWeeklySchedule } from "@/requests/schedule";
import ScheduleTableSkeleton from "@/components/loaders/ScheduleTableSkeleton";
import { Suspense } from "react";
import TeamsTableSkeleton from "@/components/loaders/TeamsTableSkeleton";
import { getAllTeams } from "@/requests/teams";
export default async function Home() {
	const { games } = await getWeeklySchedule(null, "current");
	const { teams } = await getAllTeams();

	return (
		<>
			{/* <NavBar /> */}
			<main className="bg-gray-100 min-h-screen pt-24 px-4 md:px-12 lg:px-24 ">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
					<section className="space-y-6">
						<div className="">
							<Suspense fallback={<ScheduleTableSkeleton />}>
								<ScheduleTable games={games} />
							</Suspense>
						</div>
						<div className="">
							<Suspense fallback={<TeamsTableSkeleton />}>
								<TeamsTable teams={teams} />
							</Suspense>
						</div>
					</section>
					{/* <section className="space-y-6">
						<div className=" ">
							<StandingTable />
						</div>
						<div className="">
							<PlayerStatsTable />
						</div> 
					</section>*/}
				</div>
			</main>
		</>
	);
}
