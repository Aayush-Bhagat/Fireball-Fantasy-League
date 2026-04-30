export type ToastPick = {
	playerName: string;
	teamName: string;
	teamLogo?: string | null;
	round: number;
	pick: number;
};

export default function PickToast({
	toast,
	visible,
}: {
	toast: ToastPick | null;
	visible: boolean;
}) {
	if (!toast) return null;
	return (
		<div
			className={`fixed bottom-6 right-6 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 transition-all duration-300 ease-out ${
				visible
					? "opacity-100 translate-y-0"
					: "opacity-0 translate-y-3 pointer-events-none"
			}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
				<span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
					Pick made
				</span>
				<span className="ml-auto text-[11px] text-gray-400">
					R{toast.round} · P{toast.pick}
				</span>
			</div>
			<div className="flex items-center gap-3">
				{toast.teamLogo && (
					<img
						src={toast.teamLogo}
						className="w-9 h-9 rounded-full border flex-shrink-0"
					/>
				)}
				<div className="min-w-0">
					<p className="text-sm font-semibold text-gray-900 truncate">
						{toast.playerName}
					</p>
					<p className="text-xs text-gray-500 truncate">
						Selected by {toast.teamName}
					</p>
				</div>
			</div>
		</div>
	);
}
