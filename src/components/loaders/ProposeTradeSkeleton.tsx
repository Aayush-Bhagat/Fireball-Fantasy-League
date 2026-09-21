import { Skeleton } from "@/components/ui/skeleton";

export default function ProposeTradeSkeleton() {
    const assetRows = Array.from({ length: 5 });

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-2xl" />

                        <div className="space-y-2">
                            <Skeleton className="h-9 w-64" />
                            <Skeleton className="h-5 w-[420px] max-w-[70vw]" />
                        </div>
                    </div>
                </div>

                {/* Trade Status */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Main Trade Area */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_auto_1fr]">
                    {/* Your Team */}
                    <TradePanelSkeleton
                        accent="green"
                        showTeamSelector={false}
                        rows={assetRows}
                    />

                    {/* Center Trade Icon */}
                    <div className="hidden items-center justify-center xl:flex">
                        <Skeleton className="h-14 w-14 rounded-full" />
                    </div>

                    {/* Other Team */}
                    <TradePanelSkeleton
                        accent="orange"
                        showTeamSelector
                        rows={assetRows}
                    />
                </div>

                {/* Sticky Trade Summary */}
                <div className="sticky bottom-4 z-20 mt-6">
                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-32" />
                                </div>

                                <Skeleton className="h-4 w-80 max-w-full" />
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Skeleton className="h-11 w-32 rounded-lg" />
                                <Skeleton className="h-11 w-36 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TradePanelSkeleton({
    accent,
    showTeamSelector,
    rows,
}: {
    accent: "green" | "orange";
    showTeamSelector: boolean;
    rows: unknown[];
}) {
    const isGreen = accent === "green";

    return (
        <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                isGreen ? "border-green-200" : "border-orange-200"
            }`}
        >
            {/* Panel Header */}
            <div
                className={`border-b p-5 ${
                    isGreen
                        ? "border-green-100 bg-green-50/70"
                        : "border-orange-100 bg-orange-50/70"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                    </div>

                    <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
                </div>

                {/* Team Selector */}
                {showTeamSelector && (
                    <Skeleton className="mt-4 h-10 w-full rounded-md" />
                )}
            </div>

            {/* Search */}
            <div className="border-b border-slate-100 p-4">
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4">
                <Skeleton className="my-1 h-11 w-28 rounded-lg" />
                <Skeleton className="my-1 ml-1 h-11 w-32 rounded-lg" />

                <div className="ml-auto flex items-center">
                    <Skeleton className="h-4 w-14 rounded" />
                </div>
            </div>

            {/* Asset List */}
            <div className="max-h-[600px] min-h-[360px] overflow-hidden p-4">
                {/* Available / Select All */}
                <div className="mb-3 flex items-center justify-between px-1">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                </div>

                {/* Asset Rows */}
                <div className="space-y-2">
                    {rows.map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>

                            <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
