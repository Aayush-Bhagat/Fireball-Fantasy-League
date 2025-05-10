import { Skeleton } from "../ui/skeleton";

export default function TeamInfoSkeleton() {
	return (
		<div className="p-6 flex flex-col md:flex-row items-center justify-center gap-4 bg-gray-100">
			<div className="flex items-center flex-col">
				<Skeleton className="w-32 h-32 rounded-full bg-gray-200" />
				<Skeleton className="h-10 w-48 mt-3 bg-gray-200" />
				<Skeleton className="h-6 w-36 mt-2 bg-gray-200" />
			</div>
		</div>
	);
}
