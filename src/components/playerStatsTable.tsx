"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topBatters = [
    {
        name: "Bowser",
        team: "Phoenix Firebirds",
        hr: 34,
        rbi: 98,
        avg: 0.312,
        image: "https://mario.wiki.gallery/images/5/5e/MSS_Bowser_Character_Select_Sprite.png",
    },
    {
        name: "Mario",
        team: "Denver Devils",
        hr: 41,
        rbi: 109,
        avg: 0.299,
        image: "https://mario.wiki.gallery/images/e/e4/MSS_Mario_Character_Select_Sprite.png",
    },
    {
        name: "Luigi",
        team: "Orlando Lynx",
        hr: 27,
        rbi: 85,
        avg: 0.321,
        image: "https://mario.wiki.gallery/images/5/50/MSS_Luigi_Character_Select_Sprite_1.png",
    },
    {
        name: "Yoshi",
        team: "Seattle Storm",
        hr: 22,
        rbi: 74,
        avg: 0.337,
        image: "https://mario.wiki.gallery/images/5/5b/MSS_Yoshi_Character_Select_Sprite.png",
    },
];
const topPitchers = [
    {
        name: "Wario",
        team: "Boston Titans",
        era: 2.73,
        wins: 16,
        strikeouts: 211,
        image: "https://mario.wiki.gallery/images/9/96/MSS_Wario_Character_Select_Sprite.png",
    },
    {
        name: "Donkey Kong",
        team: "Chicago Wolves",
        era: 2.89,
        wins: 14,
        strikeouts: 198,
        image: "https://mario.wiki.gallery/images/c/c5/MSS_Donkey_Kong_Character_Select_Sprite.png",
    },
    {
        name: "Daisy",
        team: "Miami Sharks",
        era: 2.65,
        wins: 17,
        strikeouts: 203,
        image: "https://mario.wiki.gallery/images/3/3e/MSS_Daisy_Character_Select_Sprite.png",
    },
    {
        name: "Toad",
        team: "Toronto Thunder",
        era: 2.58,
        wins: 15,
        strikeouts: 190,
        image: "https://mario.wiki.gallery/images/6/62/MSS_Red_Toad_Character_Select_Sprite.png",
    },
];

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

export default function PlayerStatsTable() {
    function getLogo(teamName: string) {
        return teams.find((team) => team.team === teamName)?.logo || "";
    }

    return (
        <div className="max-w-2xl mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-lg bg-white">
            <h2 className="text-3xl font-extrabold mb-4 text-center">
                Top Players
            </h2>
            <Tabs defaultValue="bat" className="w-full">
                <TabsList>
                    <TabsTrigger value="bat">Batting</TabsTrigger>
                    <TabsTrigger value="pitch">Pitching</TabsTrigger>
                </TabsList>
                <TabsContent className="" value="bat">
                    <table className="w-full text-sm md:text-base">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                                <th className="py-3 px-4 text-left">Player</th>
                                <th className="py-3 px-4 text-center">HR</th>
                                <th className="py-3 px-4 text-center">RBI</th>
                                <th className="py-3 px-4 text-center">AVG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topBatters.map((player) => (
                                <tr
                                    key={player.name}
                                    className="border-t hover:bg-gray-50 transition-all"
                                >
                                    <td className="py-3 px-4 flex items-center gap-3">
                                        <img
                                            src={player.image}
                                            alt={player.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="font-medium">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        <img
                                            src={getLogo(player.team)}
                                            alt={`${player.team} logo`}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span>{player.team}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.hr}
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.rbi}
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono">
                                        {player.avg.toFixed(3)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TabsContent>
                <TabsContent className="" value="pitch">
                    <table className="w-full text-sm md:text-base">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
                                <th className="py-3 px-4 text-left">Player</th>
                                <th className="py-3 px-4 text-center">W</th>
                                <th className="py-3 px-4 text-center">SO</th>
                                <th className="py-3 px-4 text-center">ERA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPitchers.map((player) => (
                                <tr
                                    key={player.name}
                                    className="border-t hover:bg-gray-50 transition-all"
                                >
                                    <td className="py-3 px-4 flex items-center gap-3">
                                        <img
                                            src={player.image}
                                            alt={player.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="font-medium">
                                            {player.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        <img
                                            src={getLogo(player.team)}
                                            alt={`${player.team} logo`}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span>{player.team}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.wins}
                                    </td>
                                    <td className="py-3 px-4 text-center font-semibold">
                                        {player.strikeouts}
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono">
                                        {player.era.toFixed(3)}
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
