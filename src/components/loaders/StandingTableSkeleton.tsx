import { Skeleton } from "../ui/skeleton";

export default function StandingsTableSkeleton() {
    return (
        <div className="mx-auto space-y-3 rounded-lg border border-gray-200 bg-white p-4 font-sans shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* ChartColumn icon */}
                    <Skeleton className="h-10 w-10 rounded-lg" />

                    <div className="space-y-1.5">
                        <Skeleton className="h-6 w-24 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>

                {/* Full Standings button */}
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>

            {/* Conference Tabs */}
            <div className="w-full">
                <div className="grid h-9 w-full max-w-[220px] grid-cols-2 gap-0.5 rounded-md bg-gray-100 p-1">
                    <Skeleton className="h-7 rounded-sm" />
                    <Skeleton className="h-7 rounded-sm" />
                </div>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="w-[50%] px-2.5 py-2 text-left">
                                <Skeleton className="h-3 w-10 rounded" />
                            </th>

                            <th className="w-[8%] px-1 py-2">
                                <Skeleton className="mx-auto h-3 w-3 rounded" />
                            </th>

                            <th className="w-[8%] px-1 py-2">
                                <Skeleton className="mx-auto h-3 w-3 rounded" />
                            </th>

                            <th className="w-[8%] px-1 py-2">
                                <Skeleton className="mx-auto h-3 w-3 rounded" />
                            </th>

                            <th className="w-[13%] px-1 py-2">
                                <Skeleton className="mx-auto h-3 w-7 rounded" />
                            </th>

                            <th className="w-[13%] px-1 py-2">
                                <Skeleton className="mx-auto h-3 w-7 rounded" />
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 4 }, (_, index) => (
                            <StandingsRowSkeleton key={index} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Clinch Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded" />
                </div>

                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded" />
                </div>
            </div>
        </div>
    );
}

function StandingsRowSkeleton() {
    return (
        <tr className="border-t border-gray-100">
            {/* Team */}
            <td className="px-2.5 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                    {/* Rank */}
                    <Skeleton className="h-3.5 w-4 rounded" />

                    {/* Logo */}
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />

                    {/* Team name */}
                    <Skeleton className="h-4 w-24 max-w-[45vw] rounded" />
                </div>
            </td>

            {/* W */}
            <td className="px-1 py-2.5">
                <Skeleton className="mx-auto h-4 w-4 rounded" />
            </td>

            {/* L */}
            <td className="px-1 py-2.5">
                <Skeleton className="mx-auto h-4 w-4 rounded" />
            </td>

            {/* T */}
            <td className="px-1 py-2.5">
                <Skeleton className="mx-auto h-4 w-4 rounded" />
            </td>

            {/* PCT */}
            <td className="px-1 py-2.5">
                <Skeleton className="mx-auto h-3.5 w-8 rounded" />
            </td>

            {/* RD */}
            <td className="px-1 py-2.5">
                <Skeleton className="mx-auto h-3.5 w-6 rounded" />
            </td>
        </tr>
    );
}
