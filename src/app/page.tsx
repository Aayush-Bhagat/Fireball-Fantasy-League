import NavBar from "@/components/navBar";
import StandingTable from "@/components/standingsTable";
import TeamsTable from "@/components/teamsTable";
import ScheduleTable from "@/components/scheduleTable";
import PlayerStatsTable from "@/components/playerStatsTable";
import { getWeeklySchedule } from "@/requests/schedule";
import { getStandings } from "@/requests/standings";
import { viewAllPlayers } from "@/requests/players";
export default async function Home() {
    const { games } = await getWeeklySchedule(null, "current");
    const standings = await getStandings("current");
    const { players } = await viewAllPlayers();

    return (
        <>
            <NavBar />
            <main className="bg-gray-100 min-h-screen pt-24 px-4 md:px-12 lg:px-24 ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    <section className="space-y-6">
                        <div className="">
                            <ScheduleTable games={games} />
                        </div>
                        <div className="">
                            <TeamsTable />
                        </div>
                    </section>
                    <section className="space-y-6">
                        <div className=" ">
                            <StandingTable standings={standings} />
                        </div>
                        <div className="">
                            <PlayerStatsTable players={players} />
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
