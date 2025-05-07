import React from "react";

const teamAStats = [
    { name: "Player 1", ab: 4, r: 0, h: 1, hr: 0, rbi: 1 },
    { name: "Player 2", ab: 5, r: 1, h: 2, hr: 0, rbi: 0 },
    { name: "Player 3", ab: 4, r: 1, h: 2, hr: 0, rbi: 0 },
    { name: "Player 4", ab: 4, r: 0, h: 0, hr: 0, rbi: 0 },
    { name: "Player 5", ab: 4, r: 0, h: 1, hr: 0, rbi: 0 },
    { name: "Player 6", ab: 4, r: 0, h: 2, hr: 0, rbi: 0 },
    { name: "Player 7", ab: 3, r: 1, h: 0, hr: 0, rbi: 0 },
    { name: "Player 8", ab: 3, r: 1, h: 1, hr: 0, rbi: 0 },
    { name: "Player 9", ab: 4, r: 0, h: 0, hr: 0, rbi: 0 },
];

const teamBStats = [
    { name: "Player 1", ab: 4, r: 1, h: 1, hr: 0, rbi: 0 },
    { name: "Player 2", ab: 4, r: 1, h: 1, hr: 0, rbi: 0 },
    { name: "Player 3", ab: 3, r: 1, h: 2, hr: 0, rbi: 0 },
    { name: "Player 4", ab: 4, r: 0, h: 1, hr: 0, rbi: 1 },
    { name: "Player 5", ab: 4, r: 0, h: 0, hr: 0, rbi: 0 },
    { name: "Player 6", ab: 4, r: 0, h: 1, hr: 0, rbi: 0 },
    { name: "Player 7", ab: 3, r: 0, h: 1, hr: 0, rbi: 0 },
    { name: "Player 8", ab: 3, r: 0, h: 0, hr: 0, rbi: 0 },
    { name: "Player 9", ab: 3, r: 0, h: 0, hr: 0, rbi: 1 },
];

export const BoxScore = () => {
    const renderTable = (teamName: string, icon: string, stats: any[]) => {
        const totals = stats.reduce(
            (acc, p) => {
                acc.ab += p.ab;
                acc.r += p.r;
                acc.h += p.h;
                acc.hr += p.hr;
                acc.rbi += p.rbi;
                return acc;
            },
            { ab: 0, r: 0, h: 0, hr: 0, rbi: 0 }
        );

        return (
            <div className="bg-white rounded-xl shadow-lg w-full border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-violet-100 ">
                    <h2 className="text-xl font-bold text-gray-800">
                        {teamName}
                    </h2>
                    <img
                        src={icon}
                        alt={`${teamName} logo`}
                        className="w-10 h-10"
                    />
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            {["Player", "AB", "R", "H", "HR", "RBI"].map(
                                (header) => (
                                    <th key={header} className="px-5 py-3">
                                        {header}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((p, idx) => (
                            <tr
                                key={idx}
                                className="border-t hover:bg-gray-50 transition duration-150"
                            >
                                <td className="px-5 py-3 font-medium text-gray-800">
                                    {p.name}
                                </td>
                                <td className="px-5 py-4">{p.ab}</td>
                                <td className="px-5 py-4">{p.r}</td>
                                <td className="px-5 py-4">{p.h}</td>
                                <td className="px-5 py-4">{p.hr}</td>
                                <td className="px-5 py-4">{p.rbi}</td>
                            </tr>
                        ))}
                        <tr className="font-semibold bg-gray-100 border-t">
                            <td className="px-5 py-4">TOTALS</td>
                            <td className="px-5 py-4">{totals.ab}</td>
                            <td className="px-5 py-4">{totals.r}</td>
                            <td className="px-5 py-4">{totals.h}</td>
                            <td className="px-5 py-4">{totals.hr}</td>
                            <td className="px-5 py-4">{totals.rbi}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
                    No Hit Sherlock vs. Blooper
                </h1>
                <h2 className="text-xl text-center text-gray-700 mb-8">
                    Final Score:{" "}
                    <span className="font-semibold text-black">4 - 3</span>
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                    {renderTable(
                        "No Hit Sherlock",
                        "/images/NoHitSherlockLogo.png",
                        teamAStats
                    )}
                    {renderTable("Blooper", "/images/blooper.png", teamBStats)}
                </div>
            </div>
        </div>
    );
};

export default BoxScore;
