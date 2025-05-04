import React, { useMemo } from "react";
import NavBar from "@/components/navBar";

const teams = [
    {
        team: "Phoenix Firebirds",
        logo: "https://cdn.discordapp.com/avatars/154678519559880704/f51b4ffe13d9565de09cb62e96d9e6c9.webp?size=240",
    },
    {
        team: "Denver Devils",
        logo: "https://cdn.discordapp.com/avatars/211450221270532096/2d82db96edc8a353f40a1bcce4c5ca51.webp?size=240",
    },
    {
        team: "Orlando Lynx",
        logo: "https://cdn.discordapp.com/avatars/296397828706795529/a001d16fdd8d613bc5e6c54ed210f1b4.webp?size=240",
    },
    {
        team: "Seattle Storm",
        logo: "https://cdn.discordapp.com/avatars/155399049288220673/b6261f79039b870e5f6324cf304dbf45.webp?size=240",
    },
    {
        team: "Boston Titans",
        logo: "https://cdn.discordapp.com/avatars/222243857402822658/f359ddab179ade1c5100474ae4da838f.webp?size=240",
    },
    {
        team: "Chicago Wolves",
        logo: "https://cdn.discordapp.com/avatars/154677629021061120/da633cd609f3a03c3626e0c733cd8406.webp?size=240",
    },
    {
        team: "Miami Sharks",
        logo: "https://media3.giphy.com/media/TeSYVrvuBbt8A/200w.gif?cid=6c09b952y0osty53z4v94sw6e79ybrjnyg9i5svqxq9xz4rg&ep=v1_gifs_search&rid=200w.gif&ct=g",
    },
    {
        team: "Toronto Thunder",
        logo: "https://cdn.discordapp.com/avatars/234443334578470913/6e6650c277dc6b95b5b809babba89771.webp?size=240",
    },
];

const schedule = [
    // Week 1
    {
        week: 1,
        date: "06-01-2025",
        time: "6:00 PM",
        homeTeam: "Phoenix Firebirds",
        awayTeam: "Seattle Storm",
        result: "3 - 4",
    },
    {
        week: 1,
        date: "06-01-2025",
        time: "8:00 PM",
        homeTeam: "Chicago Wolves",
        awayTeam: "Orlando Lynx",
        result: "12 - 10",
    },
    {
        week: 1,
        date: "06-02-2025",
        time: "7:00 PM",
        homeTeam: "Miami Sharks",
        awayTeam: "Boston Titans",
        result: "TBD",
    },
    {
        week: 1,
        date: "06-02-2025",
        time: "9:00 PM",
        homeTeam: "Denver Devils",
        awayTeam: "Toronto Thunder",
        result: "TBD",
    },

    // Week 2
    {
        week: 2,
        date: "06-08-2025",
        time: "6:00 PM",
        homeTeam: "Orlando Lynx",
        awayTeam: "Phoenix Firebirds",
        result: "TBD",
    },
    {
        week: 2,
        date: "06-08-2025",
        time: "8:00 PM",
        homeTeam: "Seattle Storm",
        awayTeam: "Denver Devils",
        result: "TBD",
    },
    {
        week: 2,
        date: "06-09-2025",
        time: "7:00 PM",
        homeTeam: "Boston Titans",
        awayTeam: "Toronto Thunder",
        result: "TBD",
    },
    {
        week: 2,
        date: "06-09-2025",
        time: "9:00 PM",
        homeTeam: "Chicago Wolves",
        awayTeam: "Miami Sharks",
        result: "TBD",
    },

    // Week 3
    {
        week: 3,
        date: "06-15-2025",
        time: "6:00 PM",
        homeTeam: "Toronto Thunder",
        awayTeam: "Seattle Storm",
        result: "TBD",
    },
    {
        week: 3,
        date: "06-15-2025",
        time: "8:00 PM",
        homeTeam: "Denver Devils",
        awayTeam: "Chicago Wolves",
        result: "TBD",
    },
    {
        week: 3,
        date: "06-16-2025",
        time: "7:00 PM",
        homeTeam: "Phoenix Firebirds",
        awayTeam: "Miami Sharks",
        result: "TBD",
    },
    {
        week: 3,
        date: "06-16-2025",
        time: "9:00 PM",
        homeTeam: "Orlando Lynx",
        awayTeam: "Boston Titans",
        result: "TBD",
    },
];
export default function Page() {
    const getLogo = (teamName: string) =>
        teams.find((t) => t.team === teamName)?.logo ?? "";

    const gamesByWeek = useMemo(() => {
        const grouped: Record<number, typeof schedule> = {};
        for (const game of schedule) {
            if (!grouped[game.week]) grouped[game.week] = [];
            grouped[game.week].push(game);
        }
        return grouped;
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <NavBar />
            <div className="max-w-5xl mx-auto px-4 py-20 ">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-800 mb-12">
                    Fireball League Schedule
                </h1>

                {Object.entries(gamesByWeek).map(([week, games]) => (
                    <div key={week} className="mb-14">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
                            Week {week}
                        </h2>
                        <div className="space-y-4">
                            {games.map((game, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row justify-between items-center border rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
                                >
                                    <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                                        📅 {game.date} &nbsp; ⏰ {game.time}
                                    </div>

                                    <div className="flex items-center gap-6 text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={getLogo(game.awayTeam)}
                                                alt={game.awayTeam}
                                                className="w-10 h-10 rounded-full border"
                                            />
                                            <span className="font-medium">
                                                {game.awayTeam}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-600">
                                            vs
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={getLogo(game.homeTeam)}
                                                alt={game.homeTeam}
                                                className="w-10 h-10 rounded-full border"
                                            />
                                            <span className="font-medium">
                                                {game.homeTeam}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 sm:mt-0 text-right text-purple-600 font-semibold text-sm sm:text-base">
                                        {game.result}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
