import ComparePlayers from "@/components/comparePlayers/comparePlayers";

export default async function ComparePlayersPage({
    searchParams,
}: {
    searchParams: Promise<{ rightPlayer?: string }>;
}) {
    const { rightPlayer } = await searchParams;
    const rightPlayerId = rightPlayer ?? null;

    return (
        <div className="pt-20">
            <ComparePlayers PlayerAId={rightPlayerId} />
        </div>
    );
}
