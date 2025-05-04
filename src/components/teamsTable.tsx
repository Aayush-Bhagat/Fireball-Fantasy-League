import { getAllTeams } from "@/requests/teams";
import Link from "next/link";
export default async function TeamsTable() {
    const { teams } = await getAllTeams();

    return (
        <div className="mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold mb-4">Teams</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teams.map((team) => (
                    <Link href={`/teams/${team.id}`} key={team.id}>
                        <div
                            className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                            key={team.id}
                        >
                            {team.logo && (
                                <img
                                    src={team.logo}
                                    alt={`${team.name} logo`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            )}
                            <div className="text-lg font-medium">
                                {team.name}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
