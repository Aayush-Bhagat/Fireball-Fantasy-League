"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const westConference = [
    {
        team: "Phoenix Firebirds",
        wins: 12,
        losses: 4,
        draws: 2,
        points: 38,
        logo: "https://cdn.discordapp.com/avatars/154678519559880704/f51b4ffe13d9565de09cb62e96d9e6c9.webp?size=240",
    },
    {
        team: "Denver Devils",
        wins: 10,
        losses: 6,
        draws: 2,
        points: 32,
        logo: "https://cdn.discordapp.com/avatars/211450221270532096/2d82db96edc8a353f40a1bcce4c5ca51.webp?size=240",
    },
    {
        team: "Orlando Lynx",
        wins: 8,
        losses: 8,
        draws: 2,
        points: 26,
        logo: "https://cdn.discordapp.com/avatars/296397828706795529/a001d16fdd8d613bc5e6c54ed210f1b4.webp?size=240",
    },
    {
        team: "Seattle Storm",
        wins: 7,
        losses: 9,
        draws: 2,
        points: 23,
        logo: "https://cdn.discordapp.com/avatars/155399049288220673/b6261f79039b870e5f6324cf304dbf45.webp?size=240",
    },
];

const eastConference = [
    {
        team: "Boston Titans",
        wins: 13,
        losses: 3,
        draws: 2,
        points: 41,
        logo: "https://cdn.discordapp.com/avatars/222243857402822658/f359ddab179ade1c5100474ae4da838f.webp?size=240",
    },
    {
        team: "Chicago Wolves",
        wins: 11,
        losses: 5,
        draws: 2,
        points: 35,
        logo: "https://cdn.discordapp.com/avatars/154677629021061120/da633cd609f3a03c3626e0c733cd8406.webp?size=240",
    },
    {
        team: "Miami Sharks",
        wins: 9,
        losses: 7,
        draws: 2,
        points: 29,
        logo: "https://media3.giphy.com/media/TeSYVrvuBbt8A/200w.gif?cid=6c09b952y0osty53z4v94sw6e79ybrjnyg9i5svqxq9xz4rg&ep=v1_gifs_search&rid=200w.gif&ct=g",
    },
    {
        team: "Toronto Thunder",
        wins: 6,
        losses: 10,
        draws: 2,
        points: 20,
        logo: "https://cdn.discordapp.com/avatars/234443334578470913/6e6650c277dc6b95b5b809babba89771.webp?size=240",
    },
];

export default function StandingTable() {
    return (
        <div className="mx-auto p-4 space-y-4 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold">Standings</div>
            <Tabs defaultValue="west" className="w-full">
                <TabsList>
                    <TabsTrigger value="west">Western</TabsTrigger>
                    <TabsTrigger value="east">Eastern</TabsTrigger>
                </TabsList>
                <TabsContent className="" value="west">
                    <div>
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
                                {westConference.map((team) => (
                                    <tr className="border-t" key={team.team}>
                                        <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                            <img
                                                src={team.logo}
                                                alt={`${team.team} logo`}
                                                className="w-10 h-10 mr-2 rounded-2xl"
                                            />

                                            {team.team}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.losses}
                                        </td>

                                        <td className="px-4 py-2">
                                            {(
                                                team.wins /
                                                (team.wins + team.losses)
                                            ).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins + team.losses}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
                <TabsContent value="east">
                    <div>
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
                                {eastConference.map((team) => (
                                    <tr className="border-t" key={team.team}>
                                        <td className="px-4 py-2 whitespace-nowrap flex items-center">
                                            <img
                                                src={team.logo}
                                                alt={`${team.team} logo`}
                                                className="w-10 h-10 mr-2 rounded-2xl"
                                            />
                                            {team.team}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.losses}
                                        </td>

                                        <td className="px-4 py-2">
                                            {(
                                                team.wins /
                                                (team.wins + team.losses)
                                            ).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {team.wins + team.losses}
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
