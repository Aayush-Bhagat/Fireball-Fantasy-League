import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsTableSkeleton() {
	return (
		<div className="mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
			<div className="text-2xl font-bold mb-4">Teams</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				{/* Generate 8 skeleton team items */}
				{Array.from({ length: 8 }, (_, index) => (
					<div
						key={index}
						className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
					>
						<Skeleton className="w-12 h-12 rounded-full" />
						<Skeleton className="h-6 w-32" />
					</div>
				))}
			</div>
		</div>
	);
}
