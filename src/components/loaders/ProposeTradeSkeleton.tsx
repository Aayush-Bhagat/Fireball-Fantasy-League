import { Skeleton } from "@/components/ui/skeleton";

export default function ProposeTradeSkeleton() {
	return (
		<div className="max-w-6xl mx-auto px-6 py-10 bg-white rounded-xl shadow-md space-y-6 mt-10">
			<h2 className="text-4xl font-bold text-center text-purple-700">
				Propose Trade
			</h2>

			<div className="flex flex-col md:flex-row gap-6">
				{/* Your Team Skeleton */}
				<div className="w-full md:w-1/2 border p-4 rounded-lg bg-green-50">
					<Skeleton className="h-8 w-40 mb-4 bg-green-200" />
					<div className="space-y-3 max-h-[60vh] overflow-y-auto">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between p-3 rounded shadow bg-white"
							>
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-full" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-5 w-5 rounded" />
							</div>
						))}
					</div>
				</div>

				{/* Other Team Skeleton */}
				<div className="w-full md:w-1/2 border p-4 rounded-lg bg-orange-50">
					<div className="flex justify-between items-center mb-4">
						<Skeleton className="h-8 w-40 bg-orange-200" />
						<Skeleton className="h-10 w-44 rounded bg-gray-200" />
					</div>
					<div className="space-y-3 max-h-[60vh] overflow-y-auto">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between p-3 rounded shadow bg-white"
							>
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-full" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-5 w-5 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex justify-end gap-4">
				<Skeleton className="h-10 w-24 rounded" />
				<Skeleton className="h-10 w-36 rounded" />
			</div>
		</div>
	);
}
