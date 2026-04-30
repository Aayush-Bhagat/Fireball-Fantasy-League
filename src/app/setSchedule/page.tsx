import React from "react";
import { getAllTeams } from "@/requests/teams";
import { SetSeasonSchedule } from "@/components/setSchedule";

export default async function Page() {
    const teamsData = await getAllTeams();

    return (
        <div className="pt-20 px-6">
            <SetSeasonSchedule teamsData={teamsData} />
        </div>
    );
}
