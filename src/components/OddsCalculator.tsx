"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getAllTeams } from "@/requests/teams";
import { getTeamPairOdds } from "@/requests/schedule";
import { TeamDto } from "@/dtos/teamDtos";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import OddsBadge from "@/components/OddsBadge";

/**
 * Team-pair odds calculator (bottom of the schedule page).
 *
 * Lets a user pick any two teams and computes win probabilities / moneylines
 * for a hypothetical matchup between them based on the season so far. The
 * computation runs server-side via /api/seasons/[season]/odds and uses
 * season-to-date aggregates (all completed games count).
 */
export default function OddsCalculator() {
	const { data: teamsData, isLoading: teamsLoading } = useQuery({
		queryKey: ["all-teams"],
		queryFn: getAllTeams,
	});

	const [teamAId, setTeamAId] = React.useState<string>("");
	const [teamBId, setTeamBId] = React.useState<string>("");

	const teams: TeamDto[] = teamsData?.teams ?? [];

	// Compute odds whenever two distinct teams are selected.
	const { data, isFetching, error } = useQuery({
		queryKey: ["pair-odds", teamAId, teamBId],
		queryFn: () => getTeamPairOdds("current", teamAId, teamBId),
		enabled: !!teamAId && !!teamBId && teamAId !== teamBId,
		staleTime: 30_000,
	});

	return (
		<div className="mt-16">
			<h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-1">
				Odds Calculator
			</h2>
			<p className="text-center text-gray-500 mb-8 text-sm">
				Compare any two teams based on the season so far.
			</p>

			<div className="bg-white border rounded-xl p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<TeamPicker
						label="Team A"
						teams={teams}
						value={teamAId}
						onChange={setTeamAId}
						disabledId={teamBId}
						loading={teamsLoading}
					/>

					<div className="text-lg font-bold text-gray-400 px-2">vs</div>

					<TeamPicker
						label="Team B"
						teams={teams}
						value={teamBId}
						onChange={setTeamBId}
						disabledId={teamAId}
						loading={teamsLoading}
					/>
				</div>

				<div className="mt-6 min-h-[3rem] flex items-center justify-center text-center">
					{teamAId && teamBId && teamAId === teamBId ? (
						<p className="text-sm text-amber-600">
							Select two different teams to compare.
						</p>
					) : !teamAId || !teamBId ? (
						<p className="text-sm text-gray-400">
							Select two teams to see the odds.
						</p>
					) : isFetching ? (
						<div className="flex items-center gap-2 text-gray-500 text-sm">
							<Loader2 className="h-4 w-4 animate-spin" />
							Calculating…
						</div>
					) : error ? (
						<p className="text-sm text-red-500">
							{(error as Error).message}
						</p>
					) : data ? (
						<div className="flex flex-col items-center gap-3 w-full">
							<OddsBadge
								odds={data.odds}
								teamName={data.teamA.name}
								teamAbbreviation={data.teamA.abbreviation}
								opponentName={data.teamB.name}
								opponentAbbreviation={data.teamB.abbreviation}
							/>
							<p className="text-xs text-gray-400">
								Click the badge for the full breakdown.
							</p>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

function TeamPicker({
	label,
	teams,
	value,
	onChange,
	disabledId,
	loading,
}: {
	label: string;
	teams: TeamDto[];
	value: string;
	onChange: (id: string) => void;
	disabledId: string;
	loading: boolean;
}) {
	return (
		<div className="flex flex-col items-center gap-2 w-full sm:w-64">
			<span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
				{label}
			</span>
			<Select value={value} onValueChange={onChange} disabled={loading}>
				<SelectTrigger className="w-full">
					<SelectValue
						placeholder={
							loading ? "Loading teams…" : "Select a team"
						}
					/>
				</SelectTrigger>
				<SelectContent>
					{teams.map((team) => (
						<SelectItem
							key={team.id}
							value={team.id}
							disabled={team.id === disabledId}
						>
							{team.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
