import { Skeleton } from "../ui/skeleton";

export function TradeCardSkeleton() {
	return (
		<div className="bg-gray-100 min-h-screen py-20 px-4 mt-10">
			<div className="max-w-6xl mx-auto">
				{/* Actual Title */}
				<h1 className="text-5xl font-extrabold text-center text-gray-800 mb-16 tracking-tight">
					Trade History
				</h1>

				{/* Propose Trade Button Skeleton */}
				<div className="flex justify-end mb-8">
					<Skeleton className="h-12 w-48 rounded-lg" />
				</div>

				{/* Skeleton for trade cards */}
				<div className="space-y-10">
					{[...Array(3)].map((_, idx) => (
						<div
							key={idx}
							className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
						>
							{/* Header Skeleton */}
							<div className="bg-gray-200 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-8 w-8 text-center" />
								<Skeleton className="h-10 w-10 rounded-full" />
							</div>

							{/* Content Skeleton */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
								<Skeleton className="h-24 rounded-md" />
								<Skeleton className="h-24 rounded-md" />
							</div>

							{/* Footer Skeleton */}
							<div className="px-8 py-4 border-t bg-gray-50 flex justify-between items-center">
								<Skeleton className="h-8 w-48 rounded-lg" />
								<Skeleton className="h-6 w-24 rounded-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
