import { Skeleton } from "../ui/skeleton";

export default function TeamRosterSkeleton() {
	return (
		<div className="min-h-screen bg-gray-100 font-sans">
			<div className="px-6 flex justify-center">
				<div className="w-full max-w-6xl">
					<h2 className="text-2xl font-semibold text-blue-800 mb-4">
						Team Lineup
					</h2>
					<div className="overflow-x-auto shadow-lg rounded-lg bg-white border border-gray-200">
						<table className="w-full table-auto text-left">
							<thead className="bg-blue-50 text-blue-800">
								<tr>
									<th className="px-6 py-3">Player</th>
									<th className="px-6 py-3">AVG</th>
									<th className="px-6 py-3">HR</th>
									<th className="px-6 py-3">RBI</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{Array.from({ length: 9 }, (_, index) => (
									<tr
										key={index}
										className="hover:bg-gray-50 transition cursor-pointer"
									>
										<td className="px-6 py-4 flex items-center gap-4">
											<Skeleton className="w-10 h-10 rounded-full border border-gray-300" />
											<div>
												<Skeleton className="h-5 w-32" />
											</div>
										</td>
										<td className="px-6 py-4 font-mono">
											<Skeleton className="h-5 w-12" />
										</td>
										<td className="px-6 py-4 font-mono">
											<Skeleton className="h-5 w-8" />
										</td>
										<td className="px-6 py-4 font-mono">
											<Skeleton className="h-5 w-8" />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
