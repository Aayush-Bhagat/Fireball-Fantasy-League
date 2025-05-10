import { TeamLineupDto, TeamLineupPosition } from "@/dtos/teamDtos";
import React from "react";
const positions: {
    key: TeamLineupPosition;
    label: string;
    top: string;
    left: string;
}[] = [
    { key: "P", label: "Pitcher", top: "60%", left: "50%" },
    { key: "C", label: "Catcher", top: "87%", left: "50%" },
    { key: "1B", label: "1st Base", top: "58%", left: "78%" },
    { key: "2B", label: "2nd Base", top: "40%", left: "68%" },
    { key: "3B", label: "3rd Base", top: "58%", left: "20%" },
    { key: "SS", label: "Shortstop", top: "40%", left: "30%" },
    { key: "LF", label: "Left Field", top: "20%", left: "15%" },
    { key: "CF", label: "Center Field", top: "10%", left: "50%" },
    { key: "RF", label: "Right Field", top: "20%", left: "85%" },
];
interface Props {
    lineupData: Promise<TeamLineupDto>;
}
export default async function ViewLineup({ lineupData }: Props) {
    const { fieldingLineup } = await lineupData;
    return (
        <div className="min-h-screen pt-6 px-6">
            <div className="flex flex-col md:flex-row gap-10 justify-center items-start">
                <div className="relative">
                    <img
                        src="/images/field.png"
                        alt="Field"
                        height={500}
                        width={700}
                        className="rounded-xl shadow-md border border-violet-300"
                    />
                    {positions.map((pos) => {
                        const player = fieldingLineup[pos.key];

                        return player && player.image ? (
                            <img
                                key={pos.key}
                                src={player.image}
                                alt={player.name}
                                className="absolute transition-transform duration-300 hover:scale-110"
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    transform: "translate(-50%, -50%)",
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    border: "2px solid white",
                                }}
                            />
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
}
