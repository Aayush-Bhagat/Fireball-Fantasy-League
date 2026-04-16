import { FullDraftPicks } from "@/dtos/draftDtos";
import PickCard from "./PickCard";

export function TeamColumn({
	picks,
	isComp = false,
	currentPick,
}: {
	picks: FullDraftPicks[];
	isComp?: boolean;
	currentPick: FullDraftPicks | null;
}) {
	if (picks.length === 0) {
		return (
			<div
				className={
					isComp
						? "min-h-[70px]"
						: "min-h-[110px] flex items-center justify-center text-gray-300 text-xs"
				}
			></div>
		);
	}

	return (
		<div className="space-y-2">
			{picks.map((p, i) => (
				<PickCard key={i} pick={p} currentPick={currentPick} />
			))}
		</div>
	);
}
