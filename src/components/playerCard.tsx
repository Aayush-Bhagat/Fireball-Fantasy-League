"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

type SeasonStat = {
    year: number;
    team: string;
    hr: number;
    rbi: number;
    r: number;
    avg: string;
};

type GameLog = {
    date: string;
    opponent: string;
    hr: number;
    rbi: number;
    r: number;
    avg: string;
};

const seasonStats: SeasonStat[] = [
    { year: 2024, team: "Fireballs", hr: 33, rbi: 82, r: 71, avg: ".315" },
    { year: 2023, team: "Fireballs", hr: 29, rbi: 95, r: 94, avg: ".302" },
    { year: 2022, team: "Fireballs", hr: 19, rbi: 61, r: 68, avg: ".276" },
    { year: 2021, team: "Fireballs", hr: 11, rbi: 42, r: 61, avg: ".249" },
];

const gameLogs: GameLog[] = [
    {
        date: "2024-08-29",
        opponent: "Moonshiners",
        hr: 2,
        rbi: 4,
        r: 3,
        avg: ".500",
    },
    {
        date: "2024-08-28",
        opponent: "Ghost Bats",
        hr: 1,
        rbi: 2,
        r: 1,
        avg: ".333",
    },
    {
        date: "2024-08-27",
        opponent: "Thunderbolts",
        hr: 0,
        rbi: 1,
        r: 0,
        avg: ".250",
    },
];

export default function PlayerCard({ player }: any) {
    if (!player) {
        return <div>Loading...</div>;
    }
    const batting = player.batting || 10;
    const fielding = player.fielding || 7;
    const pitching = player.pitching || 6;
    const running = player.running || 2;
    return (
        <div className="max-w-xl mx-auto p-6 bg-white border border-gray-200 rounded-2xl shadow-2xl font-sans">
            <div className="bg-purple-600 text-white rounded-xl p-6 flex items-center gap-4 shadow">
                <img
                    src={player.image}
                    alt="Player"
                    className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{player.name}</h1>
                    <p className="text-sm text-purple-200 mb-2">
                        Fireballs · OF
                    </p>
                    <div className="flex space-x-6">
                        <div className="text-center">
                            <p className="text-lg font-bold">{player.hr}</p>
                            <p className="text-sm">HR</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{player.rbi}</p>
                            <p className="text-sm">RBI</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{player.avg}</p>
                            <p className="text-sm">AVG</p>
                        </div>
                    </div>
                </div>
                <div className="mr-10">
                    <div className="flex items-center ">
                        <img
                            src={"/images/battingIcon.png"}
                            alt="Batting Icon"
                            className="w-8 h-8"
                        />
                        <Progress
                            value={batting * 10}
                            max={100}
                            className="w-48 h-2  rounded-lg"
                        />
                        {batting}
                    </div>
                    <div className="flex items-center  mt-4">
                        <img
                            src={"/images/fieldingIcon.png"}
                            alt="Fielding Icon"
                            className="w-8 h-8"
                        />
                        <Progress
                            value={fielding * 10}
                            max={100}
                            className="w-48 h-2   rounded-lg"
                        />
                        {fielding}
                    </div>
                    <div className="flex items-center  mt-4">
                        <img
                            src={"/images/pitchingIcon.png"}
                            alt="Pitching Icon"
                            className="w-8 h-8"
                        />
                        <Progress
                            value={pitching * 10}
                            max={100}
                            className="w-48 h-2 rounded-lg"
                        />
                        {pitching}
                    </div>
                    <div className="flex items-center  mt-4">
                        <img
                            src={"/images/runningIcon.png"}
                            alt="Running Icon"
                            className="w-8 h-8"
                        />
                        <Progress
                            value={running * 10}
                            max={100}
                            className="w-48 h-2   rounded-lg"
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
                </TabsList>
                <div className="mt-4 w-full min-h-[320px]">
                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4">
                        <h2 className="text-lg font-semibold mb-2">
                            Player History
                        </h2>
                        <div className="w-full table-auto bg-white border border-gray-100 shadow rounded-lg text-sm">
                            <span className="p-2 block">
                                Drafted 5th overall in 2024 By the Fireballs
                            </span>
                        </div>
                    </TabsContent>

                    {/* Recent Games */}
                    <TabsContent value="recent" className="mt-4">
                        <h2 className="text-lg font-semibold mb-2">
                            Recent Game Log
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
                                <thead className="bg-purple-600 text-white">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Opponent</th>
                                        <th className="p-2">HR</th>
                                        <th className="p-2">RBI</th>
                                        <th className="p-2">R</th>
                                        <th className="p-2">AVG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gameLogs.map((log, i) => (
                                        <tr
                                            key={i}
                                            className="even:bg-gray-50 text-center"
                                        >
                                            <td className="p-2 whitespace-nowrap">
                                                {log.date}
                                            </td>
                                            <td className="p-2">
                                                {log.opponent}
                                            </td>
                                            <td className="p-2">{log.hr}</td>
                                            <td className="p-2">{log.rbi}</td>
                                            <td className="p-2">{log.r}</td>
                                            <td className="p-2">{log.avg}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    {/* Career Stats */}
                    <TabsContent value="career" className="mt-4">
                        <h2 className="text-lg font-semibold mb-2">
                            Career Season Stats
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed bg-white border border-gray-100 shadow rounded-lg text-sm">
                                <thead className="bg-purple-600 text-white">
                                    <tr>
                                        <th className="p-2">Year</th>
                                        <th className="p-2">Team</th>
                                        <th className="p-2">HR</th>
                                        <th className="p-2">RBI</th>
                                        <th className="p-2">R</th>
                                        <th className="p-2">AVG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seasonStats.map((stat) => (
                                        <tr
                                            key={stat.year}
                                            className="even:bg-gray-50 text-center"
                                        >
                                            <td className="p-2">{stat.year}</td>
                                            <td className="p-2">{stat.team}</td>
                                            <td className="p-2">{stat.hr}</td>
                                            <td className="p-2">{stat.rbi}</td>
                                            <td className="p-2">{stat.r}</td>
                                            <td className="p-2">{stat.avg}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
