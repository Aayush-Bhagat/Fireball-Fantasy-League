import React from "react";
import { StandingsSkeleton } from "@/components/loaders/StandingsSkeleton";

export default function Loading() {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-20">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-800 mb-12">
                    Fireball League Schedule
                </h1>
                <StandingsSkeleton />
            </div>
        </div>
    );
}
