import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminGameSkeleton() {
	return (
		<div className="pt-20 px-6 max-w-full mx-auto">
			<div className="flex flex-col items-center justify-center">
				<Skeleton className="h-10 w-48 mb-10" />
				<div className="mb-12">
					<Button className="py-5 bg-violet-700 text-white" disabled>
						Submit Game
					</Button>
				</div>
			</div>

			{/* Team Section */}
			<div className="mb-12">
				<div className="flex flex-row items-center gap-2 mb-4">
					<Skeleton className="w-12 h-12 rounded-full" />
					<Skeleton className="h-8 w-40" />
					<div className="flex flex-row items-center gap-2 ml-4">
						<div>Score:</div>
						<Skeleton className="h-10 w-16" />
					</div>
				</div>

				{/* Team Table Skeleton */}
				<div className="border rounded-md">
					<div className="bg-gray-100 p-3 border-b">
						<div className="grid grid-cols-7 gap-2">
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
						</div>
					</div>
					<div className="p-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={`team-row-${i}`}
								className="grid grid-cols-7 gap-2 p-2 border-b"
							>
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Opponent Section */}
			<div>
				<div className="flex flex-row items-center gap-2 mb-4">
					<Skeleton className="w-12 h-12 rounded-full" />
					<Skeleton className="h-8 w-40" />
					<div className="flex flex-row items-center gap-2 ml-4">
						<div>Score:</div>
						<Skeleton className="h-10 w-16" />
					</div>
				</div>

				{/* Opponent Table Skeleton */}
				<div className="border rounded-md">
					<div className="bg-gray-100 p-3 border-b">
						<div className="grid grid-cols-7 gap-2">
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
						</div>
					</div>
					<div className="p-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={`opponent-row-${i}`}
								className="grid grid-cols-7 gap-2 p-2 border-b"
							>
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
