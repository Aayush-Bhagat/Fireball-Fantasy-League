"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerGameLog from "./playerGameLog";
import PlayerHistory from "./playerHistory";
import CareerStats from "./careerStats";
import PlayerAwards from "./playerAwards";
import { useQuery } from "@tanstack/react-query";
import { getCareerStats } from "@/requests/players";
type Props = {
	player: PlayerWithStatsDto;
};
export default function PlayerCard({ player }: Props) {
	const { data: careerSeasons } = useQuery({
		queryKey: ["player-career-stats", player.id],
		queryFn: async () => {
			const res = await getCareerStats(player.id);
			return res.careerStats;
		},
	});

	function inningsToOuts(ip: number): number {
		const whole = Math.floor(ip);
		const decimal = Number((ip - whole).toFixed(1));

		if (decimal === 0.1) return whole * 3 + 1;
		if (decimal === 0.2) return whole * 3 + 2;

		return whole * 3;
	}

	function outsToInnings(outs: number): number {
		const whole = Math.floor(outs / 3);
		const remainder = outs % 3;
		return Number(`${whole}.${remainder}`);
	}

	const batting = player.batting;
	const fielding = player.fielding;
	const pitching = player.pitching;
	const running = player.running;
	const playedSeasons = careerSeasons?.filter(
		(season) =>
			season.atBats > 0 ||
			season.hits > 0 ||
			season.inningsPitched > 0 ||
			season.runsAllowed > 0
	);

	const careerTotals = playedSeasons?.reduce(
		(acc, season) => {
			acc.atBats += season.atBats;
			acc.hits += season.hits;
			acc.homeRuns += season.homeRuns;
			acc.rbis += season.rbis;
			acc.runs += season.runs;

			acc.runsAllowed += season.runsAllowed;
			const seasonOuts = inningsToOuts(season.inningsPitched);

			acc.outsPitched += seasonOuts;
			acc.weightedEraSum += season.era * seasonOuts;

			return acc;
		},
		{
			atBats: 0,
			hits: 0,
			homeRuns: 0,
			rbis: 0,
			runs: 0,
			runsAllowed: 0,
			weightedEraSum: 0,
			outsPitched: 0, // ✅ changed
		}
	);

	const careerAVG =
		careerTotals && careerTotals.atBats > 0
			? (careerTotals.hits / careerTotals.atBats).toFixed(3)
			: "0.000";
	const careerERA =
		careerTotals && careerTotals.outsPitched > 0
			? (careerTotals.weightedEraSum / careerTotals.outsPitched).toFixed(
					2
			  )
			: "0.0";

	const careerIP = careerTotals ? outsToInnings(careerTotals.outsPitched) : 0;

	if (!player) {
		return <div>Loading...</div>;
	}

	return (
		<div className="max-w-full md:max-w-xl mx-auto p-4 md:p-6 bg-white border border-gray-200 rounded-2xl shadow-2xl font-sans">
			<div className="bg-purple-600 text-white rounded-xl p-6 flex items-center gap-4 shadow">
				{player.playerCardImage && (
					<img
						src={player.playerCardImage}
						alt="Player"
						className="w-20 h-20 md:w-30 md:h-30"
					/>
				)}
				<div className="flex-1">
					<h1 className="text-2xl font-bold">{player.name}</h1>
					<p className="text-sm text-purple-200 mb-2">
						{player.team?.abbreviation} · {player.position}
					</p>

					<div className="flex space-x-6">
						<div className="text-center">
							<p className="text-lg font-bold">
								{careerTotals?.homeRuns ?? 0}
							</p>
							<p className="text-sm">HR</p>
						</div>

						<div className="text-center">
							<p className="text-lg font-bold">
								{careerTotals?.rbis ?? 0}
							</p>
							<p className="text-sm">RBI</p>
						</div>

						<div className="text-center">
							<p className="text-lg font-bold">{careerAVG}</p>
							<p className="text-sm">AVG</p>
						</div>
					</div>

					<div className="flex space-x-6">
						<div className="text-center">
							<p className="text-lg font-bold">{careerERA}</p>
							<p className="text-sm">ERA</p>
						</div>

						<div className="text-center">
							<p className="text-lg font-bold">
								{careerTotals?.runsAllowed ?? 0}
							</p>
							<p className="text-sm">RA</p>
						</div>

						<div className="text-center">
							<p className="text-lg font-bold">{careerIP ?? 0}</p>
							<p className="text-sm">IP</p>
						</div>
					</div>
				</div>

				<div className="mr-10">
					<div className="flex items-center ">
						<img
							src={"/images/battingIcon.png"}
							alt="Batting Icon"
							className="w-6 h-6 md:w-8 md:h-8"
						/>
						<Progress
							value={batting * 10}
							max={100}
							className="w-28 md:w-48 h-2 rounded-lg"
						/>
						{batting}
					</div>
					<div className="flex items-center  mt-4">
						<img
							src={"/images/fieldingIcon.png"}
							alt="Fielding Icon"
							className="w-6 h-6 md:w-8 md:h-8"
						/>
						<Progress
							value={fielding * 10}
							max={100}
							className="w-28 md:w-48 h-2 rounded-lg"
						/>
						{fielding}
					</div>
					<div className="flex items-center  mt-4">
						<img
							src={"/images/pitchingIcon.png"}
							alt="Pitching Icon"
							className="w-6 h-6 md:w-8 md:h-8"
						/>
						<Progress
							value={pitching * 10}
							max={100}
							className="w-28 md:w-48 h-2 rounded-lg"
						/>
						{pitching}
					</div>
					<div className="flex items-center  mt-4">
						<img
							src={"/images/runningIcon.png"}
							alt="Running Icon"
							className="w-6 h-6 md:w-8 md:h-8"
						/>
						<Progress
							value={running * 10}
							max={100}
							className="w-28 md:w-48 h-2 rounded-lg"
						/>
						{running}
					</div>
				</div>
			</div>

			<Tabs defaultValue="recent" className="mt-6 w-full">
				<TabsList className="w-full justify-around">
					<TabsTrigger value="recent">Game Log</TabsTrigger>
					<TabsTrigger value="career">Career Stats</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
					<TabsTrigger value="awards">Awards</TabsTrigger>
				</TabsList>
				<div className="mt-4 w-full min-h-[320px]">
					{/* History Tab */}
					<TabsContent value="history" className="mt-4">
						<PlayerHistory player={player.id} />
					</TabsContent>

					{/* Recent Games */}
					<TabsContent value="recent" className="mt-4">
						<PlayerGameLog player={player.id} />
					</TabsContent>

					{/* Career Stats */}
					<TabsContent value="career" className="mt-4">
						<CareerStats player={player.id} />
					</TabsContent>
					<TabsContent value="awards" className="mt-4">
						<PlayerAwards player={player.id} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
