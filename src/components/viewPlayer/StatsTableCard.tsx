import React from "react";

type StatsTableCardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    count: number;
    children: React.ReactNode;
};

export default function StatsTableCard({
    title,
    description,
    icon,
    count,
    children,
}: StatsTableCardProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        {icon}
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {title}
                        </h2>

                        <p className="text-xs text-gray-400">{description}</p>
                    </div>
                </div>

                <div className="flex w-fit items-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
                    {count} {count === 1 ? "player" : "players"}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}
