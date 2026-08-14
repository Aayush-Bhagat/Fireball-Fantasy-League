"use client";

import React from "react";
import { InfoIcon } from "lucide-react";
import { MatchOddsDto } from "@/dtos/gameDtos";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
	odds: MatchOddsDto;
	teamName: string;
	teamAbbreviation: string;
	opponentName: string;
	opponentAbbreviation: string;
	className?: string;
};

function pct(p: number): string {
	return `${Math.round(p * 100)}%`;
}

/** Format an American moneyline with its sign. */
function formatAmerican(odds: number): string {
	return odds > 0 ? `+${odds}` : `${odds}`;
}

function TeamColumn({
	name,
	abbreviation,
	color,
	prob,
	american,
	winExpectancy,
	rs,
	ra,
	gamesPlayed,
}: {
	name: string;
	abbreviation: string;
	color: string;
	prob: number;
	american: number;
	winExpectancy: number;
	rs: number;
	ra: number;
	gamesPlayed: number;
}) {
	return (
		<div className="flex-1 rounded-lg border p-3 bg-gray-50/50">
			<div className="flex items-center gap-2 mb-2">
				<span className={cn("h-2.5 w-2.5 rounded-full", color)} />
				<span className="font-semibold text-gray-800 truncate">
					{name}
				</span>
				<span className="text-xs text-gray-400">({abbreviation})</span>
			</div>
			<div className="text-2xl font-extrabold text-gray-900 mb-1">
				{pct(prob)}
			</div>
			<div className="text-xs text-gray-500 mb-3">
				Implied moneyline:{" "}
				<span className="font-semibold text-gray-700">
					{formatAmerican(american)}
				</span>
			</div>
			<div className="space-y-1 text-xs text-gray-600">
				<div className="flex justify-between">
					<span>Season win expectancy</span>
					<span className="tabular-nums">{pct(winExpectancy)}</span>
				</div>
				<div className="flex justify-between">
					<span>Avg runs scored (RS)</span>
					<span className="tabular-nums">{rs.toFixed(2)}</span>
				</div>
				<div className="flex justify-between">
					<span>Avg runs allowed (RA)</span>
					<span className="tabular-nums">{ra.toFixed(2)}</span>
				</div>
				<div className="flex justify-between">
					<span>Games played</span>
					<span className="tabular-nums">{gamesPlayed}</span>
				</div>
			</div>
		</div>
	);
}

export default function OddsBadge({
	odds,
	teamName,
	teamAbbreviation,
	opponentName,
	opponentAbbreviation,
	className,
}: Props) {
	const [open, setOpen] = React.useState(false);

	const teamPct = pct(odds.teamProb);
	const oppPct = pct(odds.opponentProb);

	return (
		<div
			className={cn("flex items-center gap-1.5", className)}
			// Prevent the schedule card's row-click navigation when interacting
			// with the odds badge / drawer.
			onClick={(e) => e.stopPropagation()}
		>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Badge
						variant="secondary"
						role="button"
						tabIndex={0}
						className="cursor-pointer hover:bg-secondary/70 select-none text-xs sm:text-sm px-2.5 py-1"
						title="View odds breakdown"
					>
						<span className="font-semibold text-gray-800">
							{teamPct}
						</span>
						<span className="text-gray-400 mx-0.5">vs</span>
						<span className="font-semibold text-gray-800">
							{oppPct}
						</span>
					</Badge>
				</DialogTrigger>

				{odds.coldStart && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label="Cold start note"
								className="text-amber-500 hover:text-amber-600 transition"
							>
								<InfoIcon className="h-3.5 w-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent className="max-w-[220px]">
							One or both teams have very few games played, so
							their stats are blended with the league average.
						</TooltipContent>
					</Tooltip>
				)}

				<DialogContent
					onClick={(e) => e.stopPropagation()}
					className="sm:max-w-lg"
				>
					<DialogHeader>
						<DialogTitle>Match Win Probability</DialogTitle>
						<DialogDescription>
							{teamName} vs {opponentName} — estimated win chance based
							on how each team has done this season before this matchup.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-3 mt-2">
					<TeamColumn
						name={teamName}
						abbreviation={teamAbbreviation}
						color="bg-blue-500"
						prob={odds.teamProb}
						american={odds.teamAmerican}
						winExpectancy={odds.teamWinExpectancy}
						rs={odds.teamRunsScored}
						ra={odds.teamRunsAllowed}
						gamesPlayed={odds.teamGamesPlayed}
					/>
					<TeamColumn
						name={opponentName}
						abbreviation={opponentAbbreviation}
						color="bg-rose-500"
						prob={odds.opponentProb}
						american={odds.opponentAmerican}
						winExpectancy={odds.opponentWinExpectancy}
						rs={odds.opponentRunsScored}
						ra={odds.opponentRunsAllowed}
						gamesPlayed={odds.opponentGamesPlayed}
					/>
				</div>

				<div className="mt-3 rounded-lg border p-3 bg-gray-50/50">
					<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
						How this works
					</div>
					<p className="text-sm text-gray-600 leading-relaxed">
						Each team is rated by its average runs scored and allowed
						this season — teams that score more and allow fewer are
						favored. The two ratings are compared head-to-head, with a
						small nod to whoever has won more of their past meetings
						this season.
					</p>
					<div className="mt-3 space-y-1.5">
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">League avg runs / game</span>
							<span className="font-medium text-gray-800 tabular-nums">
								{odds.leagueRpg.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">
								Times these teams have met this season
							</span>
							<span className="font-medium text-gray-800 tabular-nums">
								{odds.h2hGamesPlayed}
							</span>
						</div>
					</div>
				</div>

				{odds.coldStart && (
					<div className="mt-2 space-y-1.5 text-xs text-amber-600">
						<p>
							One or both teams have very few games played
							this season, so estimates will be off.
						</p>
						<p>
							Early-season win chances blend each team&rsquo;s stats
							with the league average ({odds.leagueRpg.toFixed(2)}{" "}
							runs/game). The RS/RA shown above are the true
							per-game averages.
						</p>
					</div>
				)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
