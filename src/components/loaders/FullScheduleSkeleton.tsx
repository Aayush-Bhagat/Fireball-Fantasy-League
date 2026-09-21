import { Skeleton } from "../ui/skeleton";

export default function ScheduleListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Generate 3 skeleton weeks */}
            {Array.from({ length: 3 }, (_, weekIndex) => (
                <section
                    key={weekIndex}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                    {/* =====================================================
                        WEEK HEADER
                    ===================================================== */}

                    <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            {/* Calendar Icon */}
                            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

                            {/* Week Info */}
                            <div className="min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-20 rounded" />

                                    {/* Current badge on first week */}
                                    {weekIndex === 0 && (
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    )}
                                </div>

                                <Skeleton className="h-3.5 w-16 rounded" />
                            </div>
                        </div>

                        {/* Chevron */}
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    </div>

                    {/* =====================================================
                        GAMES
                    ===================================================== */}

                    <div className="border-t border-gray-100 bg-gray-50/50 p-3 sm:p-5">
                        <div className="space-y-3 sm:space-y-4">
                            {Array.from(
                                { length: 3 + weekIndex },
                                (_, gameIndex) => (
                                    <ScheduleGameSkeleton key={gameIndex} />
                                ),
                            )}
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}

/* =========================================================
   GAME SKELETON
========================================================= */

function ScheduleGameSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* =================================================
                    DATE / TIME
                ================================================= */}

                <div className="flex shrink-0 items-center justify-center gap-4 border-b border-gray-100 pb-3 lg:w-[190px] lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                    </div>
                </div>

                {/* =================================================
                    MATCHUP
                ================================================= */}

                <div className="flex flex-1 items-center justify-center gap-2 sm:gap-5">
                    {/* Team */}
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                        <div className="min-w-0 space-y-1.5 text-right">
                            <Skeleton className="ml-auto h-4 w-28 max-w-full rounded" />
                            <Skeleton className="ml-auto h-3 w-12 rounded" />
                        </div>

                        <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:h-11 sm:w-11" />
                    </div>

                    {/* VS */}
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9" />

                    {/* Opponent */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:h-11 sm:w-11" />

                        <div className="min-w-0 space-y-1.5">
                            <Skeleton className="h-4 w-28 max-w-full rounded" />
                            <Skeleton className="h-3 w-12 rounded" />
                        </div>
                    </div>
                </div>

                {/* =================================================
                    ODDS / SCORE
                ================================================= */}

                <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-t border-gray-100 pt-3 lg:w-[170px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}
