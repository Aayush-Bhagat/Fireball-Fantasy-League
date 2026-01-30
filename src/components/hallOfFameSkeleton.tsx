import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export default function HallOfFameSkeleton() {
	return (
		<div className="container mx-auto px-4 pt-20 pb-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<Trophy className="w-8 h-8 text-yellow-500" />
					<h1 className="text-4xl font-bold">Hall of Fame</h1>
				</div>
				<p className="text-gray-600">
					Celebrating the league&apos;s most decorated players
				</p>
			</div>

			{/* Filters Skeleton */}
			<Card className="mb-6 pb-0">
				<div className="px-6">
					<Skeleton className="h-10 w-full" />
				</div>
				<CardHeader className="pb-6">
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-20" />
						<Skeleton className="h-5 w-5 rounded-full" />
					</div>
				</CardHeader>
			</Card>

			{/* Stats Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-9 w-16" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Players Grid Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<Skeleton className="rounded-full w-16 h-16" />
									<div className="space-y-2">
										<Skeleton className="h-6 w-32" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<Skeleton className="h-8 w-16 rounded-full" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[1, 2].map((j) => (
									<div
										key={j}
										className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
									>
										<Skeleton className="w-12 h-12 rounded" />
										<div className="flex-1 space-y-2">
											<div className="flex items-center justify-between">
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-5 w-8 rounded-full" />
											</div>
											<Skeleton className="h-3 w-full" />
											<div className="flex gap-1">
												<Skeleton className="h-5 w-16 rounded" />
												<Skeleton className="h-5 w-16 rounded" />
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
