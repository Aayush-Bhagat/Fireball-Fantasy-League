import { Badge } from "@/components/ui/badge";

type Status = "complete" | "pending" | "incomplete";

interface StatusBadgeProps {
	status: Status;
	children: React.ReactNode;
}

const statusClassMap: Record<Status, string> = {
	complete: "bg-green-300 text-black",
	pending: "bg-orange-300 text-black",
	incomplete: "bg-red-300 text-black",
};

const circleColor: Record<Status, string> = {
	complete: "bg-green-400",
	pending: "bg-orange-400",
	incomplete: "bg-red-400",
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const className = statusClassMap[status];

	return (
		<Badge className={`rounded-lg ${className}`}>
			<div
				className={`w-2 h-2 inline-block mr-1 rounded-full ${circleColor[status]}`}
			></div>
			{children}
		</Badge>
	);
}
