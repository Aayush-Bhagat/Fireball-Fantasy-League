import { notFound } from "next/navigation";

import FullPlayerStats from "@/components/FullPlayerStats";
import { viewAllPlayers } from "@/requests/players";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PlayerStatsPage({ params }: Props) {
    const { id } = await params;

    try {
        const response = await viewAllPlayers();

        const player = response.players?.find((player) => player.id === id);

        if (!player) {
            notFound();
        }

        return <FullPlayerStats player={player} />;
    } catch {
        notFound();
    }
}
