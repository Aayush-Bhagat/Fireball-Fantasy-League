import React from "react";
import { getSeasonSchedule } from "@/requests/schedule";
import ScheduleList from "@/components/ScheduleList";
import FullScheduleSkeleton from "@/components/loaders/FullScheduleSkeleton";
import OddsCalculator from "@/components/OddsCalculator";
import { Suspense } from "react";

export default async function Page() {
	const { schedule } = await getSeasonSchedule("current");

	return (
		<div className="bg-gray-100 min-h-screen">
			<div className="max-w-5xl mx-auto px-4 py-20">
				<h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-800 mb-12">
					Fireball League Schedule
				</h1>
				<Suspense fallback={<FullScheduleSkeleton />}>
					<ScheduleList schedule={schedule} />
				</Suspense>
				<OddsCalculator />
			</div>
		</div>
	);
}
