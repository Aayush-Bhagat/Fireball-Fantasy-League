import React from "react";
import ExampleNumberField from "./ui/numberInput";

type Player = {
    name: string;
    imageUrl: string;
};

const createPlayers = (names: string[]): Player[] =>
    names.map((name) => ({
        name,
        imageUrl: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(
            name
        )}`,
    }));

const teamRed: Player[] = createPlayers([
    "Alex Johnson",
    "Brooke Carter",
    "Devin Ramirez",
    "Jordan Nguyen",
    "Taylor Moore",
    "Casey Lee",
    "Riley Thomas",
    "Morgan Scott",
    "Jamie Bennett",
]);

const teamBlue: Player[] = createPlayers([
    "Cameron Walker",
    "Sydney Davis",
    "Logan Parker",
    "Reese Turner",
    "Quinn Adams",
    "Avery Brooks",
    "Drew Collins",
    "Kendall Reed",
    "Skyler Morgan",
]);

export default function AdminGame() {
    return (
        <div className="pt-20 px-6 max-w-full mx-auto">
            <h1 className="text-3xl font-bold mb-10 text-center">Admin Game</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-red-700 mb-4">
                    🟥 Team Red
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full bg-red-50 shadow rounded-lg">
                        <thead className="bg-red-200 text-red-900">
                            <tr>
                                <th className="text-left px-4 py-2 w-20">
                                    Player
                                </th>
                                <th className="text-left px-4 py-2 w-40">
                                    Name
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    AB
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    H
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    HR
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    Rbi
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    IP
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    SO
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    RA
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    Walks
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamRed.map((player, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-red-100"
                                >
                                    <td className="px-4 py-2">
                                        <img
                                            src={player.imageUrl}
                                            alt={player.name}
                                            className="w-12 h-12 rounded-full border border-gray-300"
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {player.name}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-blue-700 mb-4">
                    🟦 Team Blue
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto bg-blue-50 shadow rounded-lg">
                        <thead className="bg-blue-200 text-blue-900">
                            <tr>
                                <th className="text-left px-4 py-2 w-20">
                                    Player
                                </th>
                                <th className="text-left px-4 py-2 w-40">
                                    Name
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    AB
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    H
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    HR
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    Rbi
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    IP
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    SO
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    RA
                                </th>
                                <th className="text-center px-4 py-2 w-12">
                                    Walks
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamBlue.map((player, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-blue-100"
                                >
                                    <td className="px-4 py-2">
                                        <img
                                            src={player.imageUrl}
                                            alt={player.name}
                                            className="w-12 h-12 rounded-full border border-gray-300"
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {player.name}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <ExampleNumberField />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pb-20" />
                </div>
            </div>
        </div>
    );
}
