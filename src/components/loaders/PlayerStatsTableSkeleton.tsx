import { Button } from "../ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";

export default function PlayerStatsTableSkeleton() {
	return (
		<div className="mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-lg bg-white">
			<div className="text-2xl font-bold pb-4">
				Top Players
				<Button className="float-right bg-violet-700 hover:bg-violet-800">
					View Players
				</Button>
			</div>
			<Tabs defaultValue="bat" className="w-full">
				<TabsList>
					<TabsTrigger value="bat">Batting</TabsTrigger>
					<TabsTrigger value="pitch">Pitching</TabsTrigger>
				</TabsList>
				<TabsContent value="bat">
					<table className="w-full text-sm md:text-base">
						<thead>
							<tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
								<th className="py-3 px-4 text-left">Player</th>
								<th className="py-3 px-4 text-center">Team</th>
								<th className="py-3 px-4 text-center">HR</th>
								<th className="py-3 px-4 text-center">RBI</th>
								<th className="py-3 px-4 text-center">AVG</th>
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 5 }, (_, index) => (
								<tr
									key={index}
									className="border-t hover:bg-gray-50 transition-all"
								>
									<td className="py-3 px-4 flex items-center gap-3">
										<Skeleton className="w-8 h-8 rounded-full" />
										<Skeleton className="h-5 w-28" />
									</td>
									<td className="py-3 px-4 flex items-center gap-2">
										<Skeleton className="w-6 h-6 rounded-full" />
										<Skeleton className="h-5 w-20" />
									</td>
									<td className="py-3 px-4 text-center font-semibold">
										<Skeleton className="h-5 w-8 mx-auto" />
									</td>
									<td className="py-3 px-4 text-center font-semibold">
										<Skeleton className="h-5 w-8 mx-auto" />
									</td>
									<td className="py-3 px-4 text-center font-mono">
										<Skeleton className="h-5 w-12 mx-auto" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</TabsContent>
				<TabsContent value="pitch">
					<table className="w-full text-sm md:text-base">
						<thead>
							<tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
								<th className="py-3 px-4 text-left">Player</th>
								<th className="py-3 px-4 text-center">Team</th>
								<th className="py-3 px-4 text-center">IP</th>
								<th className="py-3 px-4 text-center">SO</th>
								<th className="py-3 px-4 text-center">ERA</th>
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 5 }, (_, index) => (
								<tr
									key={index}
									className="border-t hover:bg-gray-50 transition-all"
								>
									<td className="py-3 px-4 flex items-center gap-3">
										<Skeleton className="w-8 h-8 rounded-full" />
										<Skeleton className="h-5 w-28" />
									</td>
									<td className="py-3 px-4 flex items-center gap-2">
										<Skeleton className="w-6 h-6 rounded-full" />
										<Skeleton className="h-5 w-20" />
									</td>
									<td className="py-3 px-4 text-center font-semibold">
										<Skeleton className="h-5 w-8 mx-auto" />
									</td>
									<td className="py-3 px-4 text-center font-semibold">
										<Skeleton className="h-5 w-8 mx-auto" />
									</td>
									<td className="py-3 px-4 text-center font-mono">
										<Skeleton className="h-5 w-12 mx-auto" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</TabsContent>
			</Tabs>
		</div>
	);
}
