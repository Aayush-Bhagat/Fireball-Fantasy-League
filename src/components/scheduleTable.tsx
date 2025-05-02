"use client";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function ScheduleTable() {
    const [selectedWeek, setSelectedWeek] = useState("1");
    const router = useRouter();
    function getLogo(teamName: string) {
        return teams.find((team) => team.team === teamName)?.logo || "";
    }

    const filteredGames = schedule.filter(
        (game) => String(game.week) === selectedWeek
    );

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold">
                Schedule
                <Button
                    className="float-right bg-violet-700 hover:bg-violet-800"
                    onClick={() => router.push("/schedule")}
                >
                    Full Schedule
                </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Week {selectedWeek}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Week</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={selectedWeek}
                        onValueChange={(value) => setSelectedWeek(value)}
                    >
                        <DropdownMenuRadioItem value="1">
                            Week 1
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="2">
                            Week 2
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="3">
                            Week 3
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-center text-sm text-gray-600">
                        <th className="p-2">Week</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Matchup</th>
                        <th className="p-2">Result</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredGames.map((game, index) => (
                        <tr
                            key={index}
                            className="border-t text-sm text-center"
                        >
                            <td className="p-2 pb-4">{game.week}</td>
                            <td className="p-2 pb-4">{game.date}</td>
                            <td className="p-2 pb-4">{game.time}</td>
                            <td className="p-2 pb-4 flex items-center gap-2 justify-center">
                                <img
                                    src={getLogo(game.awayTeam)}
                                    alt={`${game.awayTeam} logo`}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{game.awayTeam}</span>
                                <span className="mx-1 text-gray-500">@</span>
                                <img
                                    src={getLogo(game.homeTeam)}
                                    alt={`${game.homeTeam} logo`}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{game.homeTeam}</span>
                            </td>
                            <td className="p-2">{game.result}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
