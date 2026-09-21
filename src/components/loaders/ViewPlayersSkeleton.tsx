import React from "react";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const PlayerTableSkeleton = ({
    columns = 8,
    rows = 10,
}: {
    columns?: number;
    rows?: number;
}) => {
    return (
        <div className="overflow-hidden rounded-b-2xl border-t border-gray-100 bg-white">
            {/* Table Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
                <SkeletonBlock className="h-3 w-8" />
                <SkeletonBlock className="h-3 w-32" />

                {Array.from({ length: columns }).map((_, index) => (
                    <SkeletonBlock key={index} className="ml-auto h-3 w-10" />
                ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-0"
                >
                    {/* Rank */}
                    <SkeletonBlock className="h-4 w-6" />

                    {/* Player */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />

                        <div className="space-y-1.5">
                            <SkeletonBlock className="h-3.5 w-28" />
                            <SkeletonBlock className="h-2.5 w-16" />
                        </div>
                    </div>

                    {/* Stats */}
                    {Array.from({ length: columns }).map((_, index) => (
                        <SkeletonBlock
                            key={index}
                            className="h-4 w-10 shrink-0"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

const StatsCardSkeleton = () => {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-10 w-10 rounded-lg" />

                    <div className="space-y-2">
                        <SkeletonBlock className="h-4 w-40" />
                        <SkeletonBlock className="h-3 w-64 max-w-[50vw]" />
                    </div>
                </div>

                <SkeletonBlock className="h-7 w-12 rounded-full" />
            </div>

            {/* Table */}
            <PlayerTableSkeleton />
        </div>
    );
};

const AdvancedNavigationSkeleton = () => {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <SkeletonBlock className="h-4 w-4" />
                <SkeletonBlock className="h-3 w-20" />
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <SkeletonBlock className="h-8 w-20 rounded-md" />
                <SkeletonBlock className="h-8 w-20 rounded-md" />
                <SkeletonBlock className="h-8 w-20 rounded-md" />
            </div>
        </div>
    );
};

export const ViewPlayersSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* =====================================================
                Page Header
            ====================================================== */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-3">
                            {/* League Statistics */}
                            <div className="flex items-center gap-2">
                                <SkeletonBlock className="h-5 w-5 rounded" />
                                <SkeletonBlock className="h-3 w-32" />
                            </div>

                            {/* Title */}
                            <SkeletonBlock className="h-9 w-40" />

                            {/* Description */}
                            <SkeletonBlock className="h-4 w-full max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                Main Content
            ====================================================== */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Tabs + Search */}
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Main Tabs */}
                    <div className="flex w-full gap-1 rounded-lg bg-white p-1 shadow-sm sm:w-auto">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonBlock
                                key={index}
                                className="h-10 w-full min-w-[90px] rounded-md sm:w-28"
                            />
                        ))}
                    </div>

                    {/* Search */}
                    <SkeletonBlock className="h-10 w-full rounded-lg lg:max-w-xs" />
                </div>

                {/* =================================================
                    Stats Card
                ================================================== */}
                <StatsCardSkeleton />

                {/* =================================================
                    Advanced Section
                ================================================== */}
                <div className="mt-6 space-y-4">
                    <AdvancedNavigationSkeleton />

                    <StatsCardSkeleton />
                </div>
            </div>
        </div>
    );
};
