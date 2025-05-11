import { Skeleton } from "@/components/ui/skeleton";

export const BoxScoreSkeleton = () => {
	const renderBattingTableSkeleton = () => {
		return (
			<div className="bg-white rounded-xl shadow-lg w-full border border-gray-200 overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 bg-violet-200">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="w-10 h-10 rounded-full" />
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left">
						<thead className="bg-gray-100 text-gray-700 uppercase text-xs">
							<tr>
								{[...Array(7)].map((_, i) => (
									<th key={i} className="px-4 py-3">
										<Skeleton className="h-4 w-12" />
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{[...Array(9)].map((_, idx) => (
								<tr key={idx} className="border-t">
									{[...Array(7)].map((_, i) => (
										<td key={i} className="px-4 py-3">
											<Skeleton className="h-4 w-16" />
										</td>
									))}
								</tr>
							))}
							<tr className="font-semibold bg-gray-200 border-t">
								{[...Array(7)].map((_, i) => (
									<td key={i} className="px-4 py-3">
										<Skeleton className="h-4 w-12" />
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	const renderPitchingTableSkeleton = () => {
		return (
			<div className="bg-white rounded-xl shadow-lg w-full border border-gray-200 overflow-hidden mt-6">
				<div className="flex items-center justify-between px-6 py-4 bg-violet-200">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="w-10 h-10 rounded-full" />
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left">
						<thead className="bg-gray-100 text-gray-700 uppercase text-xs">
							<tr>
								{[...Array(7)].map((_, i) => (
									<th key={i} className="px-4 py-3">
										<Skeleton className="h-4 w-12" />
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{[...Array(3)].map((_, idx) => (
								<tr key={idx} className="border-t">
									{[...Array(7)].map((_, i) => (
										<td key={i} className="px-4 py-3">
											<Skeleton className="h-4 w-16" />
										</td>
									))}
								</tr>
							))}
							<tr className="font-semibold bg-gray-200 border-t">
								{[...Array(7)].map((_, i) => (
									<td key={i} className="px-4 py-3">
										<Skeleton className="h-4 w-12" />
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-gray-50 min-h-screen py-10 px-4">
			<div className="max-w-6xl mx-auto">
				<Skeleton className="h-10 w-3/4 mx-auto mb-4" />

				<div className="flex justify-center items-center space-x-8 mb-8">
					<div className="flex items-center space-x-4">
						<Skeleton className="w-16 h-16 rounded-full" />
						<Skeleton className="h-12 w-12" />
					</div>
					<Skeleton className="h-8 w-8" />
					<div className="flex items-center space-x-4">
						<Skeleton className="h-12 w-12" />
						<Skeleton className="w-16 h-16 rounded-full" />
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-8">
					{renderBattingTableSkeleton()}
					{renderBattingTableSkeleton()}
				</div>

				<div className="flex flex-col md:flex-row gap-8 mt-10">
					{renderPitchingTableSkeleton()}
					{renderPitchingTableSkeleton()}
				</div>
			</div>
		</div>
	);
};

export default BoxScoreSkeleton;
