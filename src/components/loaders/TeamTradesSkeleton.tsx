import { Skeleton } from "../ui/skeleton";

export function TradeCardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-violet-50/30">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>

                            <Skeleton className="h-10 w-32 rounded-lg" />

                            <Skeleton className="mt-2 h-5 w-72 max-w-full rounded" />
                        </div>

                        <Skeleton className="h-10 w-40 rounded-xl" />
                    </div>
                </div>

                {/* =====================================================
                    TRADE LIST
                ===================================================== */}

                <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <TradeSkeletonCard key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   TRADE CARD SKELETON
========================================================= */

function TradeSkeletonCard() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* =================================================
                TRADE HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 border-b bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Teams */}
                <div className="flex items-center gap-3">
                    {/* Proposing Team */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />

                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                    </div>

                    {/* Arrow */}
                    <Skeleton className="h-8 w-8 rounded-full" />

                    {/* Receiving Team */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9 rounded-full" />

                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>

            {/* =================================================
                TRADE BODY
            ================================================= */}

            <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                    {/* =================================================
                        LEFT TEAM
                    ================================================= */}

                    <TradeSideSkeleton variant="indigo" />

                    {/* =================================================
                        CENTER
                    ================================================= */}

                    <div className="flex items-center justify-center">
                        <div className="hidden h-full w-px bg-gray-100 lg:block" />

                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>

                    {/* =================================================
                        RIGHT TEAM
                    ================================================= */}

                    <TradeSideSkeleton variant="violet" />
                </div>
            </div>

            {/* =================================================
                FOOTER / ACTIONS
            ================================================= */}

            <div className="flex flex-col gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Status message */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-52 rounded" />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   TRADE SIDE SKELETON
========================================================= */

function TradeSideSkeleton({ variant }: { variant: "indigo" | "violet" }) {
    const isIndigo = variant === "indigo";

    return (
        <div
            className={`rounded-2xl border p-4 ${
                isIndigo
                    ? "border-indigo-100 bg-indigo-50/30"
                    : "border-violet-100 bg-violet-50/30"
            }`}
        >
            {/* Side Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-28 rounded" />
                </div>

                <Skeleton className="h-7 w-20 rounded-lg" />
            </div>

            {/* Assets */}
            <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, index) => (
                    <TradeAssetSkeleton key={index} variant={variant} />
                ))}
            </div>
        </div>
    );
}

/* =========================================================
   ASSET SKELETON
========================================================= */

function TradeAssetSkeleton({ variant }: { variant: "indigo" | "violet" }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                variant === "indigo"
                    ? "border-indigo-100 bg-indigo-50/70"
                    : "border-violet-100 bg-violet-50/70"
            }`}
        >
            {/* Player / Asset Image */}
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

            {/* Asset Name */}
            <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
            </div>

            {/* Asset Type */}
            <Skeleton className="hidden h-6 w-14 rounded-full sm:block" />
        </div>
    );
}
