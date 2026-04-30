import { FullDraftPicks } from "@/dtos/draftDtos";

// ---------------- HELPERS ----------------
const formatPick = (p: FullDraftPicks) => `${p.round}.${p.pick}`;

// ---------------- COMPONENTS ----------------

export default function PickCard({
	pick,
	currentPick,
}: {
	pick: FullDraftPicks;
	currentPick: FullDraftPicks | null;
}) {
	const isActive = !pick.playerSelected;

	return (
		<div
			className={`rounded-xl p-3 text-xs border min-h-[80px] flex flex-col justify-between transition-all
        ${isActive ? "bg-blue-50" : "border-gray-200 bg-white"} ${currentPick?.id === pick.id ? "ring-2 ring-blue-400" : ""}`}
		>
			{/* top row */}
			<div className="flex justify-between items-start">
				<div className="flex flex-col">
					<span className="font-semibold text-gray-700">
						{formatPick(pick)}
					</span>
					{pick.isCompensatory && (
						<span className="text-[10px] font-light">
							Comp Pick
						</span>
					)}
				</div>

				<div className="flex gap-1">
					{currentPick?.id === pick.id && (
						<span className="text-[10px] bg-red-500 text-white px-2 py-[2px] rounded-full shadow">
							OTC
						</span>
					)}
					{pick.playerSelected && (
						<span className="text-[10px] bg-green-500 text-white px-2 py-[2px] rounded-full shadow">
							✓
						</span>
					)}
				</div>
			</div>
			{/* player section */}
			{pick.playerSelected && (
				<div className="flex flex-col lg:flex-row items-center gap-2 mt-2">
					{pick.playerSelected.image && (
						<img
							src={pick.playerSelected.image}
							alt={pick.playerSelected.name}
							className="w-10 h-10 rounded-lg object-cover border shadow-sm"
						/>
					)}

					<div className="flex flex-col overflow-hidden">
						<span className="text-sm font-semibold text-gray-800 truncate">
							{pick.playerSelected.name}
						</span>
					</div>
				</div>
			)}
			{currentPick?.id === pick.id && !pick.playerSelected && (
				<div className="text-gray-400 text-[11px] mt-2">
					Waiting for pick...
				</div>
			)}
			{pick.teamId !== pick.originalTeamId && (
				<div className="mt-2 flex items-center gap-1 text-[10px] text-gray-600">
					{pick.team.logo && (
						<img
							src={pick.team.logo}
							className="w-6 h-6 rounded-full"
						/>
					)}
					<span className="text-gray-400">←</span>
					{pick.originalTeam.logo && (
						<img
							src={pick.originalTeam.logo}
							className="w-6 h-6 rounded-full"
						/>
					)}
				</div>
			)}
		</div>
	);
}
