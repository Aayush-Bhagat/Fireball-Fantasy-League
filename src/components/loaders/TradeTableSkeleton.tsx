import { Skeleton } from "@/components/ui/skeleton";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

export default function TradesTableSkeleton() {
	return (
		<div className="w-full inline-block bg-gradient-to-r from-white via-white to-white shadow-md relative rounded-lg">
			<div className="mx-auto py-2 px-12 flex items-center justify-center">
				<Carousel className="w-full">
					<CarouselPrevious className="ml-2 opacity-50" />
					<CarouselNext className="mr-2 opacity-50" />
					<CarouselContent className="flex items-center justify-center">
						{[1, 2, 3].map((item) => (
							<CarouselItem
								key={item}
								className="flex justify-center"
							>
								<div className="py-2 w-full max-w-3xl">
									<div className="flex flex-col md:flex-row items-center justify-between">
										<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 w-full">
											{/* Proposing Team Assets */}
											<div className="flex flex-col md:flex-row items-center w-full md:w-auto">
												<div className="hidden md:flex flex-wrap gap-1 justify-start">
													{[1, 2].map((i) => (
														<Skeleton
															key={i}
															className="h-6 w-20 rounded"
														/>
													))}
												</div>
												<div className="md:hidden flex flex-wrap gap-1 justify-center mb-1">
													{[1, 2].map((i) => (
														<Skeleton
															key={i}
															className="h-6 w-20 rounded"
														/>
													))}
												</div>
												<div className="md:hidden flex items-center justify-center w-full my-1">
													<span className="text-gray-300 text-lg">
														↓
													</span>
												</div>
												<div className="md:hidden flex items-center gap-2 mt-1">
													<Skeleton className="w-6 h-6 rounded-full" />
													<Skeleton className="h-4 w-24 rounded" />
												</div>
												<span className="hidden md:inline mx-2 text-gray-300">
													→
												</span>
												<div className="hidden md:flex items-center gap-2">
													<Skeleton className="w-6 h-6 rounded-full" />
													<Skeleton className="h-4 w-24 rounded" />
												</div>
											</div>

											{/* Trade Status and Date */}
											<div className="flex md:hidden flex-col items-center text-center px-2 my-2">
												<Skeleton className="h-4 w-24 rounded mb-1" />
												<Skeleton className="h-4 w-20 rounded" />
											</div>
											<div className="hidden md:flex flex-col items-center text-center px-2">
												<Skeleton className="h-4 w-24 rounded mb-1" />
												<Skeleton className="h-4 w-20 rounded" />
											</div>

											{/* Receiving Team Assets */}
											<div className="flex flex-col md:flex-row items-center w-full md:w-auto">
												<div className="hidden md:flex flex-wrap gap-1 justify-start">
													{[1, 2].map((i) => (
														<Skeleton
															key={i}
															className="h-6 w-20 rounded"
														/>
													))}
												</div>
												<div className="md:hidden flex flex-wrap gap-1 justify-center mb-1">
													{[1, 2].map((i) => (
														<Skeleton
															key={i}
															className="h-6 w-20 rounded"
														/>
													))}
												</div>
												<div className="md:hidden flex items-center justify-center w-full my-1">
													<span className="text-gray-300 text-lg">
														↓
													</span>
												</div>
												<div className="md:hidden flex items-center gap-2 mt-1">
													<Skeleton className="w-6 h-6 rounded-full" />
													<Skeleton className="h-4 w-24 rounded" />
												</div>
												<span className="hidden md:inline mx-2 text-gray-300">
													→
												</span>
												<div className="hidden md:flex items-center gap-2">
													<Skeleton className="w-6 h-6 rounded-full" />
													<Skeleton className="h-4 w-24 rounded" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</div>
	);
}
