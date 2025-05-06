import { Skeleton } from "../ui/skeleton";

export default function ScheduleListSkeleton() {
	return (
		<div className="space-y-14">
			{/* Generate 3 skeleton weeks */}
			{Array.from({ length: 3 }, (_, weekIndex) => (
				<div key={weekIndex} className="mb-14">
					<h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
						Week {weekIndex + 1}
					</h2>
					<div className="space-y-4">
						{/* Generate 3-5 skeleton games per week */}
						{Array.from(
							{ length: 6 + weekIndex },
							(_, gameIndex) => (
								<div
									key={gameIndex}
									className="flex flex-col sm:flex-row justify-between items-center border rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
								>
									{/* Date & Time */}
									<div className="text-sm text-gray-500 mb-2 sm:mb-0 w-full sm:w-[200px] text-center flex flex-col gap-1">
										<div>
											📅{" "}
											<Skeleton className="h-4 w-32 inline-block" />
										</div>
										<div>
											⏰{" "}
											<Skeleton className="h-4 w-20 inline-block" />
										</div>
									</div>

									{/* Matchup */}
									<div className="flex items-center justify-center gap-4 flex-grow w-full sm:w-auto">
										{/* Team */}
										<div className="flex items-center gap-2 w-[200px] text-left">
											<Skeleton className="w-10 h-10 rounded-full" />
											<div>
												<Skeleton className="h-5 w-28 mb-1" />
												<Skeleton className="h-3 w-12" />
											</div>
										</div>

										{/* VS */}
										<div className="text-lg font-bold text-gray-600 w-[40px] text-center">
											vs
										</div>

										{/* Opponent */}
										<div className="flex items-center gap-2 w-[200px] justify-end text-right">
											<div>
												<Skeleton className="h-5 w-28 mb-1 ml-auto" />
												<Skeleton className="h-3 w-12 ml-auto" />
											</div>
											<Skeleton className="w-10 h-10 rounded-full" />
										</div>
									</div>

									{/* Score */}
									<div className="mt-2 sm:mt-0 text-center text-purple-600 font-semibold text-sm sm:text-base w-full sm:w-[80px]">
										<Skeleton className="h-5 w-16 mx-auto" />
									</div>
								</div>
							)
						)}
					</div>
				</div>
			))}
		</div>
	);
}
