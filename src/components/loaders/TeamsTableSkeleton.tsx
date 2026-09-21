import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsTableSkeleton() {
    return (
        <div className="mx-auto rounded-lg border border-gray-200 bg-white p-4 font-sans shadow-md">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* UserGroup icon */}
                    <Skeleton className="h-8 w-8 rounded-lg" />

                    <div className="space-y-1">
                        {/* Teams title */}
                        <Skeleton className="h-6 w-20 rounded" />

                        {/* Team count */}
                        <Skeleton className="h-3 w-16 rounded" />
                    </div>
                </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Array.from({ length: 8 }, (_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-transparent bg-gray-50/70 p-2.5"
                    >
                        {/* Team Logo */}
                        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                        {/* Team Info */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-28 max-w-full rounded" />
                            <Skeleton className="h-3 w-16 rounded" />
                        </div>

                        {/* Arrow */}
                        <Skeleton className="h-4 w-4 shrink-0 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
