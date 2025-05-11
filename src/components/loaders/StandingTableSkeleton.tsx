import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "../ui/skeleton";

export default function StandingsTableSkeleton() {
	return (
		<div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
			<div className="text-2xl font-bold">Standings</div>
			<Tabs defaultValue="west" className="w-full">
				<TabsList>
					<TabsTrigger value="west">Western</TabsTrigger>
					<TabsTrigger value="east">Eastern</TabsTrigger>
				</TabsList>
				<TabsContent className="" value="west">
					<div className="overflow-x-auto">
						<table className="table-auto w-full text-center">
							<thead>
								<tr>
									<th className="px-4 py-2">Team</th>
									<th className="px-4 py-2">W</th>
									<th className="px-4 py-2">L</th>
									<th className="px-4 py-2">PCT</th>
									<th className="px-4 py-2">GP</th>
								</tr>
							</thead>
							<tbody className="w-full">
								{Array.from({ length: 4 }, (_, index) => (
									<tr className="border-t" key={index}>
										<td className="px-4 py-2 whitespace-nowrap flex items-center">
											<Skeleton className="w-10 h-10 mr-2 rounded-2xl" />
											<Skeleton className="h-5 w-24" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-12 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabsContent>
				<TabsContent value="east">
					<div className="overflow-x-auto">
						<table className="table-auto w-full text-center">
							<thead>
								<tr>
									<th className="px-4 py-2">Team</th>
									<th className="px-4 py-2">W</th>
									<th className="px-4 py-2">L</th>
									<th className="px-4 py-2">PCT</th>
									<th className="px-4 py-2">GP</th>
								</tr>
							</thead>
							<tbody>
								{Array.from({ length: 8 }, (_, index) => (
									<tr className="border-t" key={index}>
										<td className="px-4 py-2 whitespace-nowrap flex items-center">
											<Skeleton className="w-10 h-10 mr-2 rounded-2xl" />
											<Skeleton className="h-5 w-24" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-12 mx-auto" />
										</td>
										<td className="px-4 py-2">
											<Skeleton className="h-5 w-8 mx-auto" />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
