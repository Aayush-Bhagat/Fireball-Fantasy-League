import React, { Suspense } from "react";
import { getSeasonSchedule } from "@/requests/schedule";
import { getAllSeasons } from "@/requests/season";
import ScheduleList from "@/components/ScheduleList";
import FullScheduleSkeleton from "@/components/loaders/FullScheduleSkeleton";
import OddsCalculator from "@/components/OddsCalculator";

export default async function Page() {
    const [{ schedule }, { seasons }] = await Promise.all([
        getSeasonSchedule("current"),
        getAllSeasons(),
    ]);

    // Find the current season.
    // Assuming the API uses status = "Active" for the current season.
    const currentSeason = seasons.find(
        (season) => season.status === "in_progress",
    );

    const currentWeek = currentSeason?.currentWeek ?? 1;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
                <div className="mb-10">
                    <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
                        Fireball League Schedule
                    </h1>
                </div>

                <Suspense fallback={<FullScheduleSkeleton />}>
                    <ScheduleList
                        schedule={schedule}
                        currentWeek={currentWeek}
                    />
                </Suspense>

                <div className="mt-12">
                    <OddsCalculator />
                </div>
            </div>
        </div>
    );
}
