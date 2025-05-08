import React, { Suspense } from "react";
import TeamRoster from "@/components/teamRoster";
import { getTeamRoster } from "@/requests/teams";
import TeamInfo from "@/components/teamInfo";
import { getTeambyId } from "@/requests/teams";
import TeamInfoSkeleton from "@/components/loaders/TeamInfoSkeleton";
import TeamRosterSkeleton from "@/components/loaders/TeamRosterSkeleton";
import TeamSchdule from "@/components/teamSchdule";
import { getTeamSchedule } from "@/requests/schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Page({
    params,
}: {
    params: Promise<{ team: string }>;
}) {
    const { team } = await params;

    const roster = getTeamRoster(team);
    const teamInfo = getTeambyId(team);
    const teamSchedule = getTeamSchedule(team);

    return (
        <>
            <main className="pt-20 bg-gray-100">
                <Suspense fallback={<TeamInfoSkeleton />}>
                    <TeamInfo teamData={teamInfo} />
                </Suspense>
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
                            <TabsContent className="" value="roster">
                                <Suspense fallback={<TeamRosterSkeleton />}>
                                    <TeamRoster rosterData={roster} />
                                </Suspense>
                            </TabsContent>
                            <TabsContent className="" value="schedule">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <TeamSchdule teamSchedule={teamSchedule} />
                                </Suspense>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
}
