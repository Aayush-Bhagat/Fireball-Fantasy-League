import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface CareerTotals {
    careerAVG: number;
    careerHR: number;
    careerRBI: number;
    careerERA: number;
    image?: string | null;
}

export default function StatDeltaSummary({
    playerA,
    playerB,
}: {
    playerA: CareerTotals;
    playerB: CareerTotals;
}) {
    const stats = [
        { label: "AVG", a: playerA.careerAVG, b: playerB.careerAVG },
        { label: "HR", a: playerA.careerHR, b: playerB.careerHR },
        { label: "RBI", a: playerA.careerRBI, b: playerB.careerRBI },
        {
            label: "ERA",
            a: playerA.careerERA,
            b: playerB.careerERA,
            inverse: true,
        },
    ];

    return (
        <div className="border rounded-xl p-4 bg-white shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-center text-purple-700 mb-3">
                Career Snapshot
            </h3>

            <div className="flex flex-col gap-4 flex-1">
                {stats.map((s) => (
                    <Delta
                        key={s.label}
                        label={s.label}
                        a={s.a}
                        b={s.b}
                        inverse={s.inverse}
                        imageA={playerA.image}
                        imageB={playerB.image}
                    />
                ))}
            </div>
        </div>
    );
}

function Delta({
    label,
    a,
    b,
    inverse = false,
    imageA,
    imageB,
}: {
    label: string;
    a?: number;
    b?: number;
    inverse?: boolean;
    imageA?: string | null;
    imageB?: string | null;
}) {
    if (a == null || b == null) return null;

    const aNumber = Number(a);
    const bNumber = Number(b);

    // Determine better player (null = tie)
    let betterA: boolean | null = null;
    if (aNumber > bNumber) betterA = inverse ? false : true;
    else if (aNumber < bNumber) betterA = inverse ? true : false;

    const formatValue = (label: string, value: number) => {
        if (label === "AVG") return value.toFixed(3);
        if (label === "ERA") return value.toFixed(2);
        return value;
    };

    const renderPlayer = (
        value: number,
        isBetter: boolean | null,
        img?: string | null,
        isLeft = true,
    ) => (
        <div
            className={`flex items-center gap-2 font-bold text-lg ${
                isLeft ? "justify-start" : "justify-end"
            }`}
        >
            {isLeft && img && (
                <img
                    src={img}
                    alt="player"
                    className="w-12 h-12 rounded-full border-2 border-purple-200 object-cover shadow-sm"
                />
            )}
            <span
                className={
                    isBetter === null
                        ? "text-black"
                        : isBetter
                          ? "text-green-600"
                          : "text-red-600"
                }
            >
                {formatValue(label, value)}
            </span>
            {isBetter !== null &&
                (isBetter ? (
                    <ArrowUp
                        className={`w-4 h-4 ${isBetter ? "text-green-600" : ""}`}
                    />
                ) : (
                    <ArrowDown
                        className={`w-4 h-4 ${!isBetter ? "text-red-600" : ""}`}
                    />
                ))}
            {!isLeft && img && (
                <img
                    src={img}
                    alt="player"
                    className="w-12 h-12 rounded-full border-2 border-purple-200 object-cover shadow-sm"
                />
            )}
        </div>
    );

    return (
        <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3 shadow-inner border border-purple-100">
            <div className="w-1/3">
                {renderPlayer(aNumber, betterA, imageA, true)}
            </div>
            <div className="w-1/3 text-center font-medium text-gray-700">
                {label}
            </div>
            <div className="w-1/3">
                {renderPlayer(
                    bNumber,
                    betterA === null ? null : !betterA,
                    imageB,
                    false,
                )}
            </div>
        </div>
    );
}
