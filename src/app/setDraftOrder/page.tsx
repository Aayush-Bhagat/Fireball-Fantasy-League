import React from "react";
import { SetDraftOrder } from "@/components/adminSetDraftOrder";
import { getAllTeams } from "@/requests/teams";
import { SetCompensatoryPicks } from "@/components/setCompPick";
export default async function Page() {
    const teamsData = await getAllTeams();

    return (
        <div className="pt-20 px-6">
            <div className="flex gap-8 items-start">
                <div className="flex-1">
                    <SetDraftOrder teamsData={teamsData} />
                </div>

                <div className="flex-1">
                    <SetCompensatoryPicks teamsData={teamsData} />
                </div>
            </div>
        </div>
    );
}
