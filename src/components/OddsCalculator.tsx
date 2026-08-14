"use client";

import React from "react";
import Image from "next/image";
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
import { seriesWinProbability, toAmericanOdds } from "@/lib/oddsEngine";
import { cn } from "@/lib/utils";

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
	const [bestOf, setBestOf] = React.useState<1 | 3 | 5>(1);

	const teams: TeamDto[] = teamsData?.teams ?? [];

	// Compute odds whenever two distinct teams are selected.
	const { data, isFetching, error } = useQuery({
		queryKey: ["pair-odds", teamAId, teamBId],
		queryFn: () => getTeamPairOdds("current", teamAId, teamBId),
		enabled: !!teamAId && !!teamBId && teamAId !== teamBId,
		staleTime: 30_000,
	});

	// Series odds derived from the single-game win probability. Best-of-1 is
	// just the single game; best-of-3/5 treat each game as independent.
	const teamSeriesProb = data
		? seriesWinProbability(data.odds.teamProb, bestOf)
		: null;
	const opponentSeriesProb =
		teamSeriesProb !== null ? 1 - teamSeriesProb : null;

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

				<div className="mt-4 flex justify-center">
					<BestOfSelector bestOf={bestOf} onChange={setBestOf} />
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
					) : data &&
					  teamSeriesProb !== null &&
					  opponentSeriesProb !== null ? (
						<div className="flex flex-col items-center gap-4 w-full">
							{bestOf !== 1 && (
								<div className="w-full">
									<p className="text-xs font-semibold uppercase tracking-wide text-gray-400 text-center mb-2">
										Series win probability — best of {bestOf}
									</p>
									<div className="flex items-stretch justify-center gap-4">
										<SeriesColumn
											name={data.teamA.name}
											abbreviation={data.teamA.abbreviation}
											logo={data.teamA.logo}
											prob={teamSeriesProb}
											american={toAmericanOdds(teamSeriesProb)}
										/>
										<div className="self-center text-lg font-bold text-gray-400 px-2">
											vs
										</div>
										<SeriesColumn
											name={data.teamB.name}
											abbreviation={data.teamB.abbreviation}
											logo={data.teamB.logo}
											prob={opponentSeriesProb}
											american={toAmericanOdds(opponentSeriesProb)}
										/>
									</div>
								</div>
							)}

							<div className="flex flex-col items-center gap-1.5">
								<OddsBadge
									odds={data.odds}
									teamName={data.teamA.name}
									teamAbbreviation={data.teamA.abbreviation}
									opponentName={data.teamB.name}
									opponentAbbreviation={data.teamB.abbreviation}
								/>
								<p className="text-xs text-gray-400">
									Single-game odds — click for the full breakdown.
								</p>
							</div>
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
							{team.logo ? (
								<Image
									src={team.logo}
									alt=""
									width={20}
									height={20}
									unoptimized
									className="w-5 h-5 rounded-full border object-cover"
								/>
							) : (
								<span className="w-5 h-5 rounded-full border bg-gray-200" />
							)}
							<span>{team.name}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

const BEST_OF_OPTIONS = [1, 3, 5] as const;

function BestOfSelector({
	bestOf,
	onChange,
}: {
	bestOf: 1 | 3 | 5;
	onChange: (value: 1 | 3 | 5) => void;
}) {
	return (
		<div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1">
			{BEST_OF_OPTIONS.map((option) => (
				<button
					key={option}
					type="button"
					onClick={() => onChange(option)}
					className={cn(
						"px-3 py-1.5 text-sm font-medium rounded-md transition",
						bestOf === option
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-500 hover:text-gray-800",
					)}
				>
					Best of {option}
				</button>
			))}
		</div>
	);
}

function pct(p: number): string {
	return `${Math.round(p * 100)}%`;
}

function formatAmerican(odds: number): string {
	return odds > 0 ? `+${odds}` : `${odds}`;
}

function SeriesColumn({
	name,
	abbreviation,
	logo,
	prob,
	american,
}: {
	name: string;
	abbreviation: string;
	logo: string | null;
	prob: number;
	american: number;
}) {
	return (
		<div className="flex-1 max-w-[200px] rounded-lg border p-4 bg-gray-50/50 text-center">
			{logo ? (
				<Image
					src={logo}
					alt=""
					width={48}
					height={48}
					unoptimized
					className="w-12 h-12 mx-auto rounded-full border object-cover mb-2"
				/>
			) : (
				<span className="w-12 h-12 mx-auto block rounded-full border bg-gray-200 mb-2" />
			)}
			<div className="font-semibold text-gray-800 truncate">{name}</div>
			<div className="text-xs text-gray-400 mb-1">({abbreviation})</div>
			<div className="text-2xl font-extrabold text-gray-900">{pct(prob)}</div>
			<div className="text-xs text-gray-500 mt-1">
				Moneyline {formatAmerican(american)}
			</div>
		</div>
	);
}
