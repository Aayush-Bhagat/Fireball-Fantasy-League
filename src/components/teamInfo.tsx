import { TeamWithKeepsDto } from "@/dtos/teamDtos";
import React from "react";
import { Badge } from "./ui/badge";
type Props = {
    teamData: Promise<TeamWithKeepsDto>;
};
export default async function TeamInfo({ teamData }: Props) {
    const { team, awards } = await teamData;

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

                <span>
                    {awards.map((a) => (
                        <Badge
                            variant={
                                a.award.name === "Champion" ? "gold" : "silver"
                            }
                            className="rounded-full"
                            key={a.award.id}
                        >
                            {a.award.icon && (
                                <img
                                    src={a.award.icon}
                                    alt={a.award.name}
                                    className="w-6 h-6 inline-block"
                                />
                            )}
                            S{a.seasonId} {a.award.name}
                        </Badge>
                    ))}
                </span>
            </div>
        </div>
    );
}
