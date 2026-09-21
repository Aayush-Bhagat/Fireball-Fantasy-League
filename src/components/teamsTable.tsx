import { TeamResponseDto } from "@/dtos/teamDtos";
import Link from "next/link";
import { ArrowUpRight, UserGroup } from "lucide-react";

type Props = {
    teamsData: Promise<TeamResponseDto>;
};

export default async function TeamsTable({ teamsData }: Props) {
    const { teams } = await teamsData;

    return (
        <div className="mx-auto p-4 font-sans border border-gray-200 rounded-lg shadow-md bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                        <UserGroup className="h-4 w-4 text-violet-700" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">
                            Teams
                        </h2>

                        <p className="text-xs text-gray-500">
                            {teams.length}{" "}
                            {teams.length === 1 ? "team" : "teams"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teams.map((team) => (
                    <Link
                        href={`/teams/${team.id}`}
                        key={team.id}
                        className="group"
                    >
                        <div className="flex items-center gap-3 rounded-lg border border-transparent bg-gray-50/70 p-2.5 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm">
                            {/* Team Logo */}
                            <div className="relative shrink-0">
                                {team.logo ? (
                                    <img
                                        src={team.logo}
                                        alt={`${team.name} logo`}
                                        className="h-10 w-10 rounded-full border border-gray-200 bg-white object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-400">
                                        ?
                                    </div>
                                )}
                            </div>

                            {/* Team Info */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-violet-700">
                                    {team.name}
                                </p>

                                <p className="mt-0.5 text-[11px] text-gray-400">
                                    View team
                                </p>
                            </div>

                            {/* Arrow */}
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {teams.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                    <UserGroup className="mx-auto h-6 w-6 text-gray-300" />

                    <p className="mt-2 text-sm font-medium text-gray-500">
                        No teams found
                    </p>
                </div>
            )}
        </div>
    );
}
