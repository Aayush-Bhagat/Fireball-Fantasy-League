import { Skeleton } from "../ui/skeleton";

export default function PlayerStatsTableSkeleton() {
    return (
        <div className="mx-auto rounded-lg border border-gray-300 bg-white p-6 font-sans shadow-md">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Users icon */}
                    <Skeleton className="h-10 w-10 rounded-lg" />

                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-28 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>

                {/* View Players button */}
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>

            {/* Tabs */}
            <div className="mb-4">
                <div className="inline-flex rounded-md bg-gray-100 p-1">
                    <Skeleton className="h-8 w-24 rounded-sm" />
                    <Skeleton className="ml-1 h-8 w-24 rounded-sm" />
                </div>
            </div>

            {/* Player Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            {/* Player */}
                            <th className="px-2 py-3 text-left">
                                <Skeleton className="h-3 w-12 rounded" />
                            </th>

                            {/* HR */}
                            <th className="w-16 px-2 py-3">
                                <Skeleton className="mx-auto h-3 w-5 rounded" />
                            </th>

                            {/* RBI */}
                            <th className="w-16 px-2 py-3">
                                <Skeleton className="mx-auto h-3 w-6 rounded" />
                            </th>

                            {/* AVG */}
                            <th className="w-20 px-2 py-3">
                                <Skeleton className="mx-auto h-3 w-7 rounded" />
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 5 }, (_, index) => (
                            <PlayerRowSkeleton key={index} rank={index + 1} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PlayerRowSkeleton({ rank }: { rank: number }) {
    return (
        <tr
            className={`border-b border-gray-100 ${
                rank === 1 ? "bg-amber-50/20" : ""
            }`}
        >
            {/* Player Identity */}
            <td className="px-2 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    {/* Rank */}
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />

                    {/* Player Image */}
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                    {/* Player + Team */}
                    <div className="min-w-0 space-y-1.5">
                        {/* Player name */}
                        <Skeleton className="h-4 w-28 max-w-[45vw] rounded" />

                        {/* Team logo + team name */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                            <Skeleton className="h-3 w-20 max-w-[35vw] rounded" />
                        </div>
                    </div>
                </div>
            </td>

            {/* HR */}
            <td className="px-2 py-3">
                <Skeleton className="mx-auto h-4 w-6 rounded" />
            </td>

            {/* RBI */}
            <td className="px-2 py-3">
                <Skeleton className="mx-auto h-4 w-6 rounded" />
            </td>

            {/* AVG */}
            <td className="px-2 py-3">
                <Skeleton className="mx-auto h-4 w-10 rounded" />
            </td>
        </tr>
    );
}
