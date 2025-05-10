import { Button } from "@/components/ui/button";
import { getUserTeamById, getUserTeamRoster } from "@/requests/teams";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamInfo from "@/components/teamInfo";
import TeamInfoSkeleton from "@/components/loaders/TeamInfoSkeleton";
import { Suspense } from "react";
import TeamRosterSkeleton from "@/components/loaders/TeamRosterSkeleton";
import TeamRoster from "@/components/teamRoster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyTeamSchedule from "@/components/myTeamSchedule";
import { getMyTeamSchedule } from "@/requests/schedule";
export default async function Roster() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const token = await supabase.auth
        .getSession()
        .then(({ data }) => data.session?.access_token);

    if (!token) {
        redirect("/login");
    }

    const teamInfo = getUserTeamById(token);
    const roster = getUserTeamRoster(token);
    const schedule = getMyTeamSchedule(token);
    return (
        <>
            <div className="min-h-screen bg-gray-100 font-sans pt-20 pb-20">
                <Suspense fallback={<TeamInfoSkeleton />}>
                    <TeamInfo teamData={teamInfo} />
                </Suspense>
                {/* Buttons */}
                <div className="flex gap-3 justify-center mb-4">
                    <Link href="/editLineup">
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            Edit Lineup
                        </Button>
                    </Link>
                    {/* <Link href="/trade">
                        <Button className="bg-green-500 text-white hover:bg-green-600">
                            Trade
                        </Button>
                    </Link> */}
                </div>
                <div className="px-6 w-full flex justify-center">
                    <div className="w-full max-w-6xl">
                        <Tabs defaultValue="roster" className="w-full">
                            <TabsList className="bg-white border border-gray-300 rounded-md p-1 shadow-sm">
                                <TabsTrigger
                                    value="roster"
                                    className="max-w-[120px] w-full px-3 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-gray-200 data-[state=active]:text-black rounded-md hover:bg-gray-100 transition"
                                >
                                    Roster
                                </TabsTrigger>
                                <TabsTrigger
                                    value="schedule"
                                    className="max-w-[120px] w-full px-3 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-gray-200 data-[state=active]:text-black rounded-md hover:bg-gray-100 transition"
                                >
                                    Schedule
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="roster">
                                <Suspense fallback={<TeamRosterSkeleton />}>
                                    <TeamRoster rosterData={roster} />
                                </Suspense>
                            </TabsContent>
                            <TabsContent value="schedule">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <MyTeamSchedule scheduleData={schedule} />
                                </Suspense>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                {/* Roster Table */}
            </div>
        </>
    );
}
