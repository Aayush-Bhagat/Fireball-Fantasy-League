import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
	count?: number;
}

export default function TeamScheduleSkeleton({ count = 3 }: Props) {
	return (
		<div>
			<div className="text-2xl font-bold mb-4">Schedule</div>
			<ul>
				<div className="space-y-4">
					{Array.from({ length: count }).map((_, index) => (
						<div key={index}>
							<div className="flex flex-col sm:flex-row justify-between items-center border rounded-xl p-4 shadow bg-white">
								{/* Date & Time Skeleton */}
								<div className="text-sm mb-2 sm:mb-0 w-full sm:w-[200px] text-center flex flex-col gap-1">
									<Skeleton className="h-5 w-3/4 mx-auto" />
									<Skeleton className="h-5 w-1/2 mx-auto" />
								</div>

								{/* Matchup Skeleton */}
								<div className="flex items-center justify-center gap-4 flex-grow w-full sm:w-auto">
									{/* Team */}
									<div className="flex items-center gap-2 w-[200px] text-left">
										<Skeleton className="w-10 h-10 rounded-full" />
										<div className="flex-1">
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-1/2 mt-1" />
										</div>
									</div>

									{/* VS */}
									<div className="text-lg font-bold text-gray-300 w-[40px] text-center">
										vs
									</div>

									{/* Opponent */}
									<div className="flex items-center gap-2 w-[200px] justify-end text-right">
										<div className="flex-1">
											<Skeleton className="h-5 w-3/4 ml-auto" />
											<Skeleton className="h-4 w-1/2 mt-1 ml-auto" />
										</div>
										<Skeleton className="w-10 h-10 rounded-full" />
									</div>
								</div>

								{/* Score Skeleton */}
								<div className="mt-2 sm:mt-0 text-center w-full sm:w-[80px]">
									<Skeleton className="h-5 w-16 mx-auto" />
								</div>
							</div>
						</div>
					))}
				</div>
			</ul>
		</div>
	);
}
