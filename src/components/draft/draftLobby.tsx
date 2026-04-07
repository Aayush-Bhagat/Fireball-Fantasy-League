"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DraftEntryPage() {
    const router = useRouter();

    const handleJoinDraft = () => {
        // later: call backend to join draft
        router.push("/draft/room");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
                <h1 className="text-4xl font-bold text-blue-700 mb-4">
                    League Draft
                </h1>

                <p className="text-gray-600 mb-6">
                    Join your league draft and get ready to build your team
                </p>

                <Button
                    onClick={handleJoinDraft}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                >
                    Enter Draft
                </Button>
            </div>
        </div>
    );
}
