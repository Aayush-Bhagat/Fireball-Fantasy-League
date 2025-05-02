"use client";

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

export default function TeamsTable() {
    return (
        <div className="max-w-2xl mx-auto p-6 font-sans border border-gray-300 rounded-lg shadow-md bg-white">
            <div className="text-2xl font-bold mb-4">Teams</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teams.map((team) => (
                    <div
                        className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 rounded-lg"
                        key={team.team}
                    >
                        <img
                            src={team.logo}
                            alt={`${team.team} logo`}
                            className="w-12 h-12 rounded-2xl object-cover"
                        />
                        <div className="text-lg font-medium">{team.team}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
