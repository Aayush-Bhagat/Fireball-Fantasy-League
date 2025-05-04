"use client";
import React from "react";
import NavBar from "@/components/navBar";
import TeamRoster from "@/components/teamRoster";
import { useParams } from "next/navigation";
import { getTeamRoster } from "@/requests/teams";
import { useQuery } from "@tanstack/react-query";
import TeamInfo from "@/components/teamInfo";
import { getTeambyId } from "@/requests/teams";

export default function page() {
    const { team } = useParams();

    const { data: roster } = useQuery({
        queryKey: ["team-roster", team],
        queryFn: async () => {
            const res = await getTeamRoster(team as string);
            return res.roster;
        },
    });

    const { data: teamInfo } = useQuery({
        queryKey: ["team-info", team],
        queryFn: async () => {
            const res = await getTeambyId(team as string);
            return res;
        },
    });
    return (
        <>
            <NavBar />
            <main className="pt-20 bg-gray-100">
                {teamInfo && <TeamInfo team={teamInfo.team} />}
                {roster && <TeamRoster roster={roster} />}
            </main>
        </>
    );
}
