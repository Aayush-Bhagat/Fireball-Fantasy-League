export const FullPlayerStatsSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* =================================================
                TOP NAV
            ================================================= */}

            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

                        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100 sm:w-[340px]" />

                        <div className="hidden h-4 w-36 animate-pulse rounded bg-slate-100 lg:block" />
                    </div>
                </div>
            </div>

            {/* =================================================
                PLAYER HERO
            ================================================= */}

            <section className="relative overflow-hidden bg-slate-300">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                            {/* Player image */}

                            <div className="h-40 w-40 shrink-0 animate-pulse rounded-3xl bg-white/30 sm:h-48 sm:w-48" />

                            {/* Player information */}

                            <div className="w-full text-center sm:text-left">
                                <div className="mb-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <div className="h-9 w-9 animate-pulse rounded-full bg-white/30" />

                                    <div className="h-7 w-16 animate-pulse rounded-full bg-white/30" />

                                    <div className="h-7 w-20 animate-pulse rounded-full bg-white/30" />
                                </div>

                                <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-white/30 sm:mx-0" />

                                <div className="mt-3 h-5 w-32 animate-pulse rounded bg-white/20" />

                                <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                                    <div className="h-9 w-28 animate-pulse rounded-lg bg-white/20" />

                                    <div className="h-9 w-32 animate-pulse rounded-lg bg-white/20" />
                                </div>
                            </div>
                        </div>

                        {/* Ratings */}

                        <div className="w-full animate-pulse rounded-2xl border border-white/10 bg-black/10 p-5 lg:w-80">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="h-3 w-28 rounded bg-white/30" />

                                <div className="h-4 w-4 rounded bg-white/20" />
                            </div>

                            <div className="space-y-5">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index}>
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="h-5 w-5 rounded bg-white/20" />

                                            <div className="h-3 w-16 rounded bg-white/20" />

                                            <div className="ml-auto h-4 w-6 rounded bg-white/30" />
                                        </div>

                                        <div className="h-1.5 rounded-full bg-white/20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* =================================================
                    CAREER OVERVIEW
                ================================================= */}

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />

                            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
                        </div>

                        <div className="hidden h-9 w-24 animate-pulse rounded-lg bg-slate-100 sm:block" />
                    </div>

                    {/* Main overview cards */}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <OverviewCardSkeleton key={index} />
                        ))}
                    </div>

                    {/* Pitching overview cards */}

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <OverviewCardSkeleton key={index} />
                        ))}
                    </div>
                </section>

                {/* =================================================
                    FULL STATISTICS
                ================================================= */}

                <section className="mt-10">
                    <div className="mb-5">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />

                                <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />
                            </div>

                            <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-slate-100 sm:block" />
                        </div>
                    </div>

                    {/* Tabs */}

                    <div className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-11 animate-pulse rounded-lg bg-slate-200/70"
                            />
                        ))}
                    </div>

                    <div className="mt-5 space-y-5">
                        <StatGroupSkeleton />

                        <StatGroupSkeleton />

                        <StatGroupSkeleton />
                    </div>
                </section>

                {/* =================================================
                    SEASON STATISTICS
                ================================================= */}

                <section className="mt-10">
                    <div className="mb-4">
                        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />

                        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-100" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <SeasonTableSkeleton />
                    </div>
                </section>

                {/* =================================================
                    PLAYER DETAILS
                ================================================= */}

                <section className="mt-10">
                    <div className="mb-4">
                        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />

                        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />
                    </div>

                    {/* Detail tabs */}

                    <div className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-10 animate-pulse rounded-lg bg-slate-200/70 ${
                                    index === 1 ? "hidden sm:block" : ""
                                }`}
                            />
                        ))}
                    </div>

                    {/* Detail content */}

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="space-y-4">
                            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />

                            <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-20 animate-pulse rounded-xl bg-slate-50"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <div className="mt-10 flex justify-center">
                    <div className="h-11 w-48 animate-pulse rounded-xl bg-white shadow-sm" />
                </div>
            </main>
        </div>
    );
};

/* =========================================================
   OVERVIEW CARD SKELETON
========================================================= */

function OverviewCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />

                <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
    );
}

/* =========================================================
   STAT GROUP SKELETON
========================================================= */

function StatGroupSkeleton() {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
                <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <StatCardSkeleton key={index} />
                ))}
            </div>
        </section>
    );
}

/* =========================================================
   STAT CARD SKELETON
========================================================= */

function StatCardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-7 w-14 animate-pulse rounded bg-slate-200" />
        </div>
    );
}
function SeasonTableSkeleton() {
    return (
        <div className="space-y-0">
            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-6 border-b border-slate-100 px-5 py-5 last:border-0"
                >
                    <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />

                    <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
                </div>
            ))}
        </div>
    );
}
