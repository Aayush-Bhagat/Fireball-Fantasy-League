import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditLineup from "@/components/editLineup";
import BattingOrder from "@/components/battingOrder";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserTeamById, getUserTeamRoster } from "@/requests/teams";
import { getLineup } from "@/requests/lineup";

export default async function Page() {
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

    const teamInfo = await getUserTeamById(token);
    const roster = getUserTeamRoster(token);
    const lineup = getLineup(token);
    const battingOrder = getLineup(token);
    return (
        <div className="min-h-screen bg-gradient-to-b bg-gray-100 pt-20 px-6">
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-4">
                    {teamInfo.team.logo && (
                        <img
                            src={teamInfo.team.logo}
                            alt="Team Logo"
                            className="w-16 h-16 rounded-full object-cover shadow-lg"
                        />
                    )}

                    <h1 className="text-4xl font-extrabold text-black drop-shadow-sm">
                        {teamInfo.team.name}
                    </h1>
                </div>
            </div>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-6xl">
                    <Tabs defaultValue="lineup" className="w-full">
                        <TabsList className="bg-white border border-gray-300 rounded-md p-1 shadow-sm">
                            <TabsTrigger
                                value="lineup"
                                className="max-w-[120px] w-full px-3 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-gray-200 data-[state=active]:text-black rounded-md hover:bg-gray-100 transition"
                            >
                                Lineup
                            </TabsTrigger>
                            <TabsTrigger
                                value="order"
                                className="max-w-[120px] w-full px-3 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-gray-200 data-[state=active]:text-black rounded-md hover:bg-gray-100 transition"
                            >
                                Batting Order
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="lineup">
                            <EditLineup
                                rosterData={roster}
                                lineupData={lineup}
                                token={token}
                            />
                        </TabsContent>
                        <TabsContent value="order">
                            <BattingOrder
                                rosterData={roster}
                                battingOrderData={battingOrder}
                                token={token}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
