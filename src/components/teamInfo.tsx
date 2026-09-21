import { TeamWithKeepsDto } from "@/dtos/teamDtos";
import React from "react";
import { Badge } from "./ui/badge";

type Props = {
    teamData: Promise<TeamWithKeepsDto>;
};

export default async function TeamInfo({ teamData }: Props) {
    const { team, awards } = await teamData;

    return (
        <div className="flex justify-center px-6 py-6">
            <div className="flex w-full max-w-5xl flex-col items-center">
                {/* Team Logo */}
                {team.logo && (
                    <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        className="h-32 w-32 rounded-full object-cover"
                    />
                )}

                {/* Team Name */}
                <h1 className="mt-3 text-4xl font-bold text-blue-900">
                    {team.name}
                </h1>

                {/* Conference */}
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {team.conference} Conference
                </p>

                {/* Awards */}
                {awards.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {awards.map((a) => (
                            <Badge
                                key={`${a.seasonId}-${a.award.id}`}
                                variant={
                                    a.award.name === "Champion"
                                        ? "gold"
                                        : "silver"
                                }
                                className="rounded-full px-3 py-1"
                            >
                                {a.award.icon && (
                                    <img
                                        src={a.award.icon}
                                        alt=""
                                        className="mr-1 h-5 w-5 object-contain"
                                    />
                                )}

                                <span>
                                    S{a.seasonId} {a.award.name}
                                </span>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
