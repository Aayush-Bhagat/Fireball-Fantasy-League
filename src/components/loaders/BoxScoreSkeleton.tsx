import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = ({
    columns,
    rows = 5,
    minWidth = "min-w-[1000px]",
}: {
    columns: number;
    rows?: number;
    minWidth?: string;
}) => {
    return (
        <div className="overflow-x-auto">
            <table className={`w-full ${minWidth} text-sm`}>
                <thead>
                    <tr className="border-b border-slate-200 bg-white">
                        {Array.from({ length: columns }).map((_, index) => (
                            <th key={index} className="px-4 py-2.5 text-center">
                                <Skeleton
                                    className={`mx-auto h-3 ${
                                        index === 0 ? "w-16" : "w-8"
                                    }`}
                                />
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-slate-100"
                        >
                            {Array.from({ length: columns }).map(
                                (_, columnIndex) => (
                                    <td key={columnIndex} className="px-4 py-3">
                                        <Skeleton
                                            className={`mx-auto h-4 ${
                                                columnIndex === 0
                                                    ? "w-24"
                                                    : "w-10"
                                            }`}
                                        />
                                    </td>
                                ),
                            )}
                        </tr>
                    ))}

                    <tr className="bg-slate-50">
                        {Array.from({ length: columns }).map((_, index) => (
                            <td key={index} className="px-4 py-3">
                                <Skeleton
                                    className={`${
                                        index === 0 ? "w-16" : "w-10"
                                    } h-4`}
                                />
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

/* =============================================================
   TEAM TABLE CARD
============================================================= */

const TeamTableSkeleton = ({
    columns,
    rows = 5,
    minWidth,
}: {
    columns: number;
    rows?: number;
    minWidth?: string;
}) => {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Team Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                    <div className="min-w-0 space-y-2">
                        <Skeleton className="h-5 w-32" />

                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>

                <div className="hidden space-y-1.5 text-right sm:block">
                    <Skeleton className="ml-auto h-3 w-20" />

                    <Skeleton className="ml-auto h-5 w-12" />
                </div>
            </div>

            {/* Mobile Team Stat */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 sm:hidden">
                <Skeleton className="h-3 w-20" />

                <Skeleton className="h-4 w-10" />
            </div>

            <TableSkeleton columns={columns} rows={rows} minWidth={minWidth} />
        </div>
    );
};

/* =============================================================
   SIMPLE TEAM TABLE
============================================================= */

const SimpleTeamTableSkeleton = ({
    columns,
    rows = 5,
    minWidth,
}: {
    columns: number;
    rows?: number;
    minWidth?: string;
}) => {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />

                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            <TableSkeleton columns={columns} rows={rows} minWidth={minWidth} />
        </div>
    );
};

/* =============================================================
   SECTION HEADER
============================================================= */

const SectionHeaderSkeleton = () => {
    return (
        <div className="mb-3 space-y-2">
            <Skeleton className="h-6 w-28" />

            <Skeleton className="h-4 w-56" />
        </div>
    );
};

/* =============================================================
   GAME HEADER
============================================================= */

const GameHeaderSkeleton = () => {
    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-8">
                {/* Box Score / Title */}
                <div className="mb-5 flex flex-col items-center gap-2">
                    <Skeleton className="h-3 w-20" />

                    <Skeleton className="h-7 w-64 sm:h-8 sm:w-80" />
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-4 sm:gap-10">
                    {/* Team */}
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-4">
                        <div className="flex min-w-0 flex-col items-end gap-2">
                            <Skeleton className="h-5 w-24 sm:w-32" />

                            <Skeleton className="h-3 w-12" />
                        </div>

                        <Skeleton className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
                    </div>

                    {/* Score */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Skeleton className="h-12 w-10 sm:h-14 sm:w-12" />

                        <Skeleton className="h-7 w-3" />

                        <Skeleton className="h-12 w-10 sm:h-14 sm:w-12" />
                    </div>

                    {/* Opponent */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                        <Skeleton className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />

                        <div className="flex min-w-0 flex-col gap-2">
                            <Skeleton className="h-5 w-24 sm:w-32" />

                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* =============================================================
   MAIN SKELETON
============================================================= */

export const BoxScoreSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-6xl">
                {/* =====================================================
                    GAME HEADER
                ====================================================== */}

                <GameHeaderSkeleton />

                {/* =====================================================
                    BATTING
                ====================================================== */}

                <section>
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <TeamTableSkeleton
                            columns={15}
                            rows={9}
                            minWidth="min-w-[1000px]"
                        />

                        <TeamTableSkeleton
                            columns={15}
                            rows={9}
                            minWidth="min-w-[1000px]"
                        />
                    </div>
                </section>

                {/* =====================================================
                    PITCHING
                ====================================================== */}

                <section className="mt-8">
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <TeamTableSkeleton
                            columns={21}
                            rows={3}
                            minWidth="min-w-[1300px]"
                        />

                        <TeamTableSkeleton
                            columns={21}
                            rows={3}
                            minWidth="min-w-[1300px]"
                        />
                    </div>
                </section>

                {/* =====================================================
                    ADVANCED BATTING
                ====================================================== */}

                <section className="mt-8">
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <TeamTableSkeleton
                            columns={11}
                            rows={5}
                            minWidth="min-w-[950px]"
                        />

                        <TeamTableSkeleton
                            columns={11}
                            rows={5}
                            minWidth="min-w-[950px]"
                        />
                    </div>
                </section>

                {/* =====================================================
                    ADVANCED PITCHING
                ====================================================== */}

                <section className="mt-8">
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <TeamTableSkeleton
                            columns={7}
                            rows={3}
                            minWidth="min-w-[800px]"
                        />

                        <TeamTableSkeleton
                            columns={7}
                            rows={3}
                            minWidth="min-w-[800px]"
                        />
                    </div>
                </section>

                {/* =====================================================
                    BASERUNNING
                ====================================================== */}

                <section className="mt-8">
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <SimpleTeamTableSkeleton
                            columns={5}
                            rows={5}
                            minWidth="min-w-[650px]"
                        />

                        <SimpleTeamTableSkeleton
                            columns={5}
                            rows={5}
                            minWidth="min-w-[650px]"
                        />
                    </div>
                </section>

                {/* =====================================================
                    FIELDING
                ====================================================== */}

                <section className="mt-8">
                    <SectionHeaderSkeleton />

                    <div className="grid grid-cols-1 gap-5">
                        <SimpleTeamTableSkeleton
                            columns={9}
                            rows={5}
                            minWidth="min-w-[1000px]"
                        />

                        <SimpleTeamTableSkeleton
                            columns={9}
                            rows={5}
                            minWidth="min-w-[1000px]"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BoxScoreSkeleton;
