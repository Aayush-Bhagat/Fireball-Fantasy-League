import { TeamDto } from "@/dtos/teamDtos";
import React from "react";

type Props = {
    team: TeamDto;
};
export default function TeamInfo({ team }: Props) {
    return (
        <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center  flex-col">
                {team.logo && (
                    <img
                        src={team.logo}
                        alt="Team Logo"
                        className="w-32 h-32 rounded-full object-cover"
                    />
                )}

                <h1 className="text-4xl font-bold text-blue-900">
                    {team.name}
                </h1>
                <h2>{team.conference} Conference</h2>
            </div>
        </div>
    );
}
