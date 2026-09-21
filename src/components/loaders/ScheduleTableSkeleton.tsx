import { Skeleton } from "../ui/skeleton";

export default function ScheduleTableSkeleton() {
    return (
        <div className="mx-auto space-y-3 rounded-lg border border-gray-200 bg-white p-4 font-sans shadow-md">
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Calendar Icon */}
                    <Skeleton className="h-10 w-10 rounded-lg" />

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Skeleton className="h-6 w-24 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>

                {/* Full Schedule */}
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>

            {/* =====================================================
                WEEK SELECTOR
            ===================================================== */}

            <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-8 w-32 rounded-md" />

                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                </div>
            </div>

            {/* =====================================================
                GAMES
            ===================================================== */}

            <div className="space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <ScheduleGameSkeleton key={index} />
                ))}
            </div>

            {/* =====================================================
                LEGEND
            ===================================================== */}

            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                </div>

                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-1.5 w-1.5 rounded-full" />
                    <Skeleton className="h-3 w-28 rounded" />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   GAME SKELETON
========================================================= */

function ScheduleGameSkeleton() {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5">
            <div className="flex items-center gap-2">
                {/* =================================================
                    TIME
                ================================================= */}

                <div className="w-12 shrink-0 space-y-1 text-center">
                    <Skeleton className="mx-auto h-2.5 w-7 rounded" />
                    <Skeleton className="mx-auto h-3.5 w-10 rounded" />
                </div>

                {/* Divider */}
                <div className="h-9 w-px bg-gray-200" />

                {/* =================================================
                    MATCHUP
                ================================================= */}

                <div className="min-w-0 flex-1">
                    {/* Team */}
                    <SkeletonTeamRow />

                    {/* Opponent */}
                    <SkeletonTeamRow />
                </div>

                {/* =================================================
                    ODDS
                ================================================= */}

                <div className="hidden w-[100px] shrink-0 items-center justify-center sm:flex">
                    <Skeleton className="h-7 w-20 rounded-full" />
                </div>

                {/* =================================================
                    RESULT
                ================================================= */}

                <div className="w-12 shrink-0 space-y-1 text-center">
                    <Skeleton className="mx-auto h-3.5 w-3.5 rounded" />
                    <Skeleton className="mx-auto h-3.5 w-10 rounded" />
                </div>
            </div>

            {/* =================================================
                MOBILE ODDS
            ================================================= */}

            <div className="mt-2 flex justify-center border-t border-gray-100 pt-2 sm:hidden">
                <Skeleton className="h-7 w-20 rounded-full" />
            </div>
        </div>
    );
}

/* =========================================================
   TEAM ROW SKELETON
========================================================= */

function SkeletonTeamRow() {
    return (
        <div className="flex items-center justify-between rounded-md px-2 py-1">
            <div className="flex min-w-0 items-center gap-2">
                {/* Team Logo */}
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />

                {/* Team Name */}
                <Skeleton className="h-3.5 w-24 max-w-[45vw] rounded" />

                {/* Favorite Indicator */}
                <Skeleton className="hidden h-2.5 w-2.5 rounded sm:block" />
            </div>

            {/* Score */}
            <Skeleton className="ml-2 h-3.5 w-4 shrink-0 rounded" />
        </div>
    );
}
