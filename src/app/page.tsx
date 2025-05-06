import StandingTable from "@/components/standingsTable";
import TeamsTable from "@/components/teamsTable";
import ScheduleTable from "@/components/scheduleTable";
import PlayerStatsTable from "@/components/playerStatsTable";
import { getWeeklySchedule } from "@/requests/schedule";
import { getStandings } from "@/requests/standings";
import { viewAllPlayers } from "@/requests/players";
import ScheduleTableSkeleton from "@/components/loaders/ScheduleTableSkeleton";
import { Suspense } from "react";
import TeamsTableSkeleton from "@/components/loaders/TeamsTableSkeleton";
import { getAllTeams } from "@/requests/teams";
import StandingsTableSkeleton from "@/components/loaders/StandingTableSkeleton";
import PlayerStatsTableSkeleton from "@/components/loaders/PlayerStatsTableSkeleton";

export default async function Home() {
	const games = getWeeklySchedule(null, "current");
	const standings = getStandings("current");
	const players = viewAllPlayers();
	const teams = getAllTeams();

	return (
		<>
			{/* <NavBar /> */}
			<main className="bg-gray-100 min-h-screen pt-24 px-4 md:px-12 lg:px-24 ">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
					<section className="space-y-6">
						<div className="">
							<Suspense fallback={<ScheduleTableSkeleton />}>
								<ScheduleTable gamesData={games} />
							</Suspense>
						</div>
						<div className="">
							<Suspense fallback={<TeamsTableSkeleton />}>
								<TeamsTable teamsData={teams} />
							</Suspense>
						</div>
					</section>
					<section className="space-y-6">
						<div className=" ">
							<Suspense fallback={<StandingsTableSkeleton />}>
								<StandingTable standingsData={standings} />
							</Suspense>
						</div>
						<div className="">
							<Suspense fallback={<PlayerStatsTableSkeleton />}>
								<PlayerStatsTable playersData={players} />
							</Suspense>
						</div>
					</section>
				</div>
			</main>
		</>
	);
}
