import { Skeleton } from "../ui/skeleton";

export default function ScheduleTableSkeleton() {
    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold flex justify-between items-center">
                <span>Schedule</span>
                <Skeleton className="h-9 w-32" />{" "}
                {/* Full Schedule button skeleton */}
            </div>
            <Skeleton className="h-10 w-32" /> {/* Week dropdown skeleton */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-center text-sm text-gray-600">
                            <th className="p-2">Week</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Matchup</th>
                            <th className="p-2">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Generate 5 skeleton rows */}
                        {Array.from({ length: 4 }, (_, index) => (
                            <tr
                                key={index}
                                className="border-t text-sm text-center"
                            >
                                <td className="p-2 pb-4">
                                    <Skeleton className="h-5 w-5 mx-auto" />
                                </td>
                                <td className="p-2 pb-4">
                                    <div className="flex flex-col gap-1 items-center">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </td>
                                <td className="p-2 pb-4">
                                    <div className="flex items-center justify-center gap-4">
                                        {/* Team */}
                                        <div className="flex items-center gap-2 w-[160px] text-left">
                                            <Skeleton className="w-6 h-6 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>

                                        {/* vs */}
                                        <span className="text-gray-500 font-semibold">
                                            @
                                        </span>

                                        {/* Opponent */}
                                        <div className="flex items-center gap-2 w-[160px] justify-end text-right">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="w-6 h-6 rounded-full" />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <Skeleton className="h-4 w-12 mx-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
