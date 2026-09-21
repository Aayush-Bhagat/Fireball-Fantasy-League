import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditLineup from "@/components/editLineup";
import BattingOrder from "@/components/battingOrder";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserTeamById, getUserTeamRoster } from "@/requests/teams";
import { getLineup } from "@/requests/lineup";
import { ClipboardList, ListOrdered } from "lucide-react";

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
        <main className="min-h-screen bg-gray-100">
            {/* ================================================== */}
            {/* Team Header */}
            {/* ================================================== */}

            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            {teamInfo.team.logo ? (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 p-1.5 shadow-sm sm:h-16 sm:w-16">
                                    <img
                                        src={teamInfo.team.logo}
                                        alt={`${teamInfo.team.name} logo`}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 sm:h-16 sm:w-16">
                                    {teamInfo.team.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
                                    Team Management
                                </p>

                                <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    {teamInfo.team.name}
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Set your starting lineup and batting order
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Main Content */}
            {/* ================================================== */}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Tabs defaultValue="lineup" className="w-full">
                    {/* ================================================== */}
                    {/* Navigation */}
                    {/* ================================================== */}

                    <div className="mb-5 overflow-x-auto">
                        <TabsList className="inline-flex h-auto min-w-full justify-start gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm sm:min-w-0">
                            <TabsTrigger
                                value="lineup"
                                className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-violet-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Starting Lineup
                            </TabsTrigger>

                            <TabsTrigger
                                value="order"
                                className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-violet-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                <ListOrdered className="h-4 w-4" />
                                Batting Order
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ================================================== */}
                    {/* Starting Lineup */}
                    {/* ================================================== */}

                    <TabsContent
                        value="lineup"
                        className="mt-0 focus-visible:outline-none"
                    >
                        <EditLineup rosterData={roster} lineupData={lineup} />
                    </TabsContent>

                    {/* ================================================== */}
                    {/* Batting Order */}
                    {/* ================================================== */}

                    <TabsContent
                        value="order"
                        className="mt-0 focus-visible:outline-none"
                    >
                        <BattingOrder
                            rosterData={roster}
                            battingOrderData={battingOrder}
                        />
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
