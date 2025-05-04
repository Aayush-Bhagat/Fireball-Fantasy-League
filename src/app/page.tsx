import NavBar from "@/components/navBar";
import StandingTable from "@/components/standingsTable";
import TeamsTable from "@/components/teamsTable";
import ScheduleTable from "@/components/scheduleTable";
import PlayerStatsTable from "@/components/playerStatsTable";
export default function Home() {
    return (
        <>
            <NavBar />
            <main className="bg-gray-100 min-h-screen pt-24 px-4 md:px-12 lg:px-24 ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                        <div className="">
                            <ScheduleTable />
                        </div>
                        <div className="">
                            <TeamsTable />
                        </div>
                    </section>
                    <section className="space-y-6">
                        <div className=" ">
                            <StandingTable />
                        </div>
                        <div className="">
                            <PlayerStatsTable />
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
