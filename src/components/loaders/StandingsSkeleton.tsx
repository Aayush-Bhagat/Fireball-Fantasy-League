import React from "react";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const StandingsTableSkeleton = ({
    rows = 6,
    league = false,
}: {
    rows?: number;
    league?: boolean;
}) => {
    const statColumns = league ? 12 : 9;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="h-3 w-24" />
                </div>

                {!league && (
                    <div className="flex items-center gap-4">
                        <SkeletonBlock className="h-3 w-16" />
                        <SkeletonBlock className="h-3 w-16" />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table
                    className={`w-full ${
                        league ? "min-w-[1050px]" : "min-w-[850px]"
                    } text-sm`}
                >
                    {/* Header */}
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/70">
                            <th className="w-[30%] px-5 py-3 text-left">
                                <SkeletonBlock className="h-3 w-10" />
                            </th>

                            {Array.from({ length: statColumns }).map(
                                (_, index) => (
                                    <th key={index} className="px-2 py-3">
                                        <SkeletonBlock className="mx-auto h-3 w-7" />
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>

                    {/* Rows */}
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-gray-100 last:border-0"
                            >
                                {/* Team */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        {/* Rank */}
                                        <SkeletonBlock className="h-3 w-5" />

                                        {/* Logo */}
                                        <SkeletonBlock
                                            className={
                                                league
                                                    ? "h-7 w-7 rounded-full"
                                                    : "h-9 w-9 rounded-full"
                                            }
                                        />

                                        {/* Team Name */}
                                        <div className="min-w-0 space-y-1.5">
                                            <SkeletonBlock className="h-3.5 w-28" />
                                            <SkeletonBlock className="h-2.5 w-20" />
                                        </div>
                                    </div>
                                </td>

                                {/* Stats */}
                                {Array.from({
                                    length: statColumns,
                                }).map((_, index) => (
                                    <td key={index} className="px-2 py-4">
                                        <SkeletonBlock className="mx-auto h-3.5 w-8" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {Array.from({
                        length: league ? 8 : 7,
                    }).map((_, index) => (
                        <SkeletonBlock key={index} className="h-3 w-24" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const StandingsSkeleton = () => {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* =================================================
                    Header
                ================================================== */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        {/* Breadcrumb */}
                        <div className="mb-3 flex items-center gap-2">
                            <SkeletonBlock className="h-3 w-10" />
                            <SkeletonBlock className="h-3 w-3" />
                            <SkeletonBlock className="h-3 w-16" />
                        </div>

                        {/* Title */}
                        <SkeletonBlock className="h-10 w-40" />

                        {/* Description */}
                        <div className="mt-3 space-y-2">
                            <SkeletonBlock className="h-3.5 w-full max-w-2xl" />
                            <SkeletonBlock className="h-3.5 w-full max-w-xl" />
                        </div>
                    </div>
                </div>

                {/* =================================================
                    Main Tabs
                ================================================== */}
                <section>
                    <div className="mb-5 flex justify-center sm:justify-start">
                        <div className="grid h-11 w-full max-w-lg grid-cols-3 gap-1 rounded-xl bg-gray-200/70 p-1">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <SkeletonBlock
                                    key={index}
                                    className="h-9 rounded-lg"
                                />
                            ))}
                        </div>
                    </div>

                    {/* =================================================
                        Western/Eastern Standings
                    ================================================== */}
                    <StandingsTableSkeleton rows={6} />
                </section>
            </div>
        </main>
    );
};
