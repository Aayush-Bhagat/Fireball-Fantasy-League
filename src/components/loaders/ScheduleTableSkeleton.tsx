import { Skeleton } from "../ui/skeleton";

export default function ScheduleTableSkeleton() {
    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold flex justify-between items-center">
                <span>Schedule</span>
                <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-center text-sm text-gray-600">
                            <th className="p-2">Time</th>
                            <th className="p-2">Matchup</th>
                            <th className="p-2">Odds</th>
                            <th className="p-2">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 4 }, (_, index) => (
                            <tr
                                key={index}
                                className="border-t text-sm text-center"
                            >
                                <td className="p-2 pb-4">
                                    <Skeleton className="h-4 w-10 mx-auto" />
                                </td>
                                <td className="p-2 pb-4">
                                    <div className="flex items-center justify-center gap-4">
                                        {/* Team */}
                                        <div className="flex items-center gap-2 min-w-0 max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[280px]">
                                            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>

                                        {/* vs */}
                                        <span className="text-gray-500 font-semibold">
                                            @
                                        </span>

                                        {/* Opponent */}
                                        <div className="flex items-center justify-end gap-2 min-w-0 max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[280px]">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2 pb-4">
                                    <Skeleton className="h-5 w-14 mx-auto" />
                                </td>
                                <td className="p-2">
                                    <Skeleton className="h-4 w-10 mx-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
