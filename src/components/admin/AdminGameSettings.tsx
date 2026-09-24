import {
	AdminGameDto,
	StadiumDto,
	UpdateGameScoreRequestDto,
} from "@/dtos/gameDtos";
import { Moon, Sun, Check, ChevronDown, Loader2 } from "lucide-react";
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { updateGameScore } from "@/requests/games";

type GameSettingsValues = {
	stadiumId: string | null;
	stadiumTime: "Day" | "Night";
	bannedStadiumId: string | null;
};

/* "team" = game.team, "opponent" = game.opponent */
type Side = "team" | "opponent";

/* Runs scored per inning, one entry per inning. null = inning not played (shown as "X") */
type InningRuns = Record<Side, (number | null)[]>;

const DEFAULT_INNINGS = 9;
const DEFAULT_TOP_SIDE: Side = "opponent";

/* The bottom of the last inning starts as null since it's often not played */
const createEmptyInnings = (count: number, topSide: Side): InningRuns => {
	const bottomSide: Side = topSide === "team" ? "opponent" : "team";

	const innings: InningRuns = {
		team: Array(count).fill(0),
		opponent: Array(count).fill(0),
	};

	innings[bottomSide][count - 1] = null;

	return innings;
};

const sumRuns = (runs: (number | null)[]) =>
	runs.reduce<number>((total, r) => total + (r ?? 0), 0);

type Props = {
	game: AdminGameDto;
	stadiums: StadiumDto[];
	teamScore: number;
	opponentScore: number;
	setTeamScore: Dispatch<SetStateAction<number>>;
	setOpponentScore: Dispatch<SetStateAction<number>>;
};

export default function GameSettings({
	game,
	stadiums,
	teamScore,
	opponentScore,
	setTeamScore,
	setOpponentScore,
}: Props) {
	const supabase = createClient();
	const [values, setValues] = useState<GameSettingsValues>({
		stadiumId: null,
		stadiumTime: "Day",
		bannedStadiumId: null,
	});

	/* Line score state */
	const [inningRuns, setInningRuns] = useState<InningRuns>(() =>
		createEmptyInnings(DEFAULT_INNINGS, DEFAULT_TOP_SIDE),
	);
	const [topSide, setTopSide] = useState<Side>(DEFAULT_TOP_SIDE);
	const bottomSide: Side = topSide === "team" ? "opponent" : "team";

	const updateValue = <K extends keyof GameSettingsValues>(
		key: K,
		value: GameSettingsValues[K],
	) => {
		setValues((current) => ({
			...current,
			[key]: value,
		}));
	};

	/* Keep the total score in sync with the line score */
	const syncScores = (next: InningRuns) => {
		setTeamScore(sumRuns(next.team));
		setOpponentScore(sumRuns(next.opponent));
	};

	const handleRunsChange = (
		side: Side,
		inningIndex: number,
		runs: number | null,
	) => {
		const next: InningRuns = {
			...inningRuns,
			[side]: inningRuns[side].map((current, index) =>
				index === inningIndex ? runs : current,
			),
		};

		setInningRuns(next);
		syncScores(next);
	};

	const handleTopSideChange = (nextTop: Side) => {
		if (nextTop === topSide) return;

		const lastIndex = DEFAULT_INNINGS - 1;
		const oldBottom = bottomSide;
		const newBottom = topSide;

		// Keep the unplayed bottom of the 9th with the bottom slot, if nothing was entered there yet
		if (
			inningRuns[oldBottom][lastIndex] === null &&
			inningRuns[newBottom][lastIndex] === 0
		) {
			setInningRuns((current) => ({
				...current,
				[oldBottom]: current[oldBottom].map((r, i) =>
					i === lastIndex ? 0 : r,
				),
				[newBottom]: current[newBottom].map((r, i) =>
					i === lastIndex ? null : r,
				),
			}));
		}

		setTopSide(nextTop);
	};

	const handleAddInning = () => {
		setInningRuns((current) => ({
			team: [...current.team, 0],
			opponent: [...current.opponent, 0],
		}));
	};

	const handleRemoveInning = () => {
		if (inningRuns.team.length <= 1) return;

		const next: InningRuns = {
			team: inningRuns.team.slice(0, -1),
			opponent: inningRuns.opponent.slice(0, -1),
		};

		setInningRuns(next);
		syncScores(next);
	};

	const handleSubmit = useMutation({
		mutationFn: async () => {
			await supabase.auth.getUser();

			if (!values.stadiumId || !values.bannedStadiumId) {
				throw new Error("Please select a stadium");
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error("No session found");
			}

			const accessToken = session.access_token;

			const updateGameRequest: UpdateGameScoreRequestDto = {
				teamScore: teamScore,

				opponentScore: opponentScore,

				teamId: game.team.id,

				opponentId: game.opponent.id,

				stadiumId: values.stadiumId,

				bannedStadiumId: values.bannedStadiumId,

				stadiumTime: values.stadiumTime,

				topTeamId: topSide === "team" ? game.team.id : game.opponent.id,

				bottomTeamId:
					bottomSide === "team" ? game.team.id : game.opponent.id,

				topInningRuns:
					topSide === "team" ? inningRuns.team : inningRuns.opponent,

				bottomInningRuns:
					bottomSide === "team"
						? inningRuns.team
						: inningRuns.opponent,
			};

			await updateGameScore(game.gameId, updateGameRequest, accessToken);
		},
	});

	const selectedStadium = useMemo(
		() =>
			stadiums.find((stadium) => stadium.stadiumId === values.stadiumId),
		[stadiums, values.stadiumId],
	);

	const selectedBannedStadium = useMemo(
		() =>
			stadiums.find(
				(stadium) => stadium.stadiumId === values.bannedStadiumId,
			),
		[stadiums, values.bannedStadiumId],
	);

	const homeTeam = game?.team;
	const awayTeam = game?.opponent;

	return (
		<div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			{/* Teams / Score */}
			<div className="mb-8">
				<h2 className="mb-4 text-lg font-semibold text-gray-900">
					Game Score
				</h2>

				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
					<TeamScore
						team={homeTeam}
						score={teamScore}
						onScoreChange={setTeamScore}
					/>

					<div className="text-sm font-medium text-gray-400">VS</div>

					<TeamScore
						team={awayTeam}
						score={opponentScore}
						onScoreChange={setOpponentScore}
					/>
				</div>
			</div>

			{/* Line score */}
			<LineScore
				teams={{ team: homeTeam, opponent: awayTeam }}
				topSide={topSide}
				bottomSide={bottomSide}
				onTopSideChange={handleTopSideChange}
				inningRuns={inningRuns}
				onRunsChange={handleRunsChange}
				onAddInning={handleAddInning}
				onRemoveInning={handleRemoveInning}
			/>

			{/* Game Settings */}
			<div className="grid gap-5 sm:grid-cols-3">
				{/* Stadium */}
				<StadiumDropdown
					label="Stadium"
					stadiums={stadiums}
					value={values.stadiumId}
					onChange={(value) => updateValue("stadiumId", value)}
				/>

				{/* Stadium Time */}
				<StadiumTimeSelector
					value={values.stadiumTime}
					onChange={(value) => updateValue("stadiumTime", value)}
				/>

				{/* Banned Stadium */}
				<StadiumDropdown
					label="Banned Stadium"
					stadiums={stadiums}
					value={values.bannedStadiumId}
					noneLabel="None"
					onChange={(value) => updateValue("bannedStadiumId", value)}
				/>
			</div>

			{/* Selected settings */}
			<div className="mt-6 space-y-3">
				{/* Selected Stadium */}
				{selectedStadium && (
					<div className="rounded-lg bg-gray-50 p-4">
						<div className="flex items-center justify-between gap-4">
							<div className="flex min-w-0 items-center gap-3">
								<StadiumIcon
									stadium={selectedStadium}
									size="md"
								/>

								<div className="min-w-0">
									<div className="text-xs font-medium uppercase tracking-wide text-gray-500">
										Selected Stadium
									</div>

									<div className="mt-1 truncate font-semibold text-gray-900">
										{selectedStadium.name}
									</div>
								</div>
							</div>

							<StadiumTimeBadge value={values.stadiumTime} />
						</div>
					</div>
				)}

				{/* Selected Banned Stadium */}
				{selectedBannedStadium && (
					<div className="rounded-lg border border-red-100 bg-red-50 p-4">
						<div className="flex items-center gap-3">
							<StadiumIcon
								stadium={selectedBannedStadium}
								size="md"
							/>

							<div>
								<div className="text-xs font-medium uppercase tracking-wide text-red-500">
									Banned Stadium
								</div>

								<div className="mt-1 font-semibold text-red-900">
									{selectedBannedStadium.name}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* No banned stadium */}
				{!selectedBannedStadium && (
					<div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
						No stadium is banned.
					</div>
				)}
			</div>

			{/* Submit */}
			<div className="mt-6 flex justify-end border-t border-gray-100 pt-6">
				<button
					type="button"
					onClick={() => handleSubmit.mutate()}
					disabled={handleSubmit.isPending}
					className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{handleSubmit.isPending && (
						<Loader2 className="h-4 w-4 animate-spin" />
					)}

					{handleSubmit.isPending ? "Submitting..." : "Submit Game"}
				</button>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Line Score                                                                  */
/* -------------------------------------------------------------------------- */

type LineScoreProps = {
	teams: Record<Side, AdminGameDto["team"] | undefined>;
	topSide: Side;
	bottomSide: Side;
	onTopSideChange: (side: Side) => void;
	inningRuns: InningRuns;
	onRunsChange: (
		side: Side,
		inningIndex: number,
		runs: number | null,
	) => void;
	onAddInning: () => void;
	onRemoveInning: () => void;
};

function LineScore({
	teams,
	topSide,
	bottomSide,
	onTopSideChange,
	inningRuns,
	onRunsChange,
	onAddInning,
	onRemoveInning,
}: LineScoreProps) {
	const inningCount = inningRuns.team.length;
	const innings = Array.from({ length: inningCount }, (_, i) => i + 1);

	const rows: { side: Side; half: "Top" | "Bottom" }[] = [
		{ side: topSide, half: "Top" },
		{ side: bottomSide, half: "Bottom" },
	];

	return (
		<div className="mb-8">
			<h2 className="mb-4 text-lg font-semibold text-gray-900">
				Runs by Inning
			</h2>

			<div className="overflow-x-auto rounded-lg border border-gray-200">
				<table className="w-full border-collapse text-center text-sm">
					<thead>
						<tr className="bg-gray-50 text-xs font-medium text-gray-500">
							<th className="sticky left-0 z-10 min-w-[9rem] bg-gray-50 px-3 py-2 text-left">
								Team
							</th>

							{innings.map((inning) => (
								<th
									key={inning}
									className="min-w-[2.75rem] px-1 py-2"
								>
									{inning}
								</th>
							))}

							<th className="border-l border-gray-200 px-4 py-2 text-gray-700">
								R
							</th>
						</tr>
					</thead>

					<tbody>
						{rows.map(({ side, half }) => {
							const team = teams[side];

							return (
								<tr
									key={half}
									className="border-t border-gray-200"
								>
									<td className="sticky left-0 z-10 bg-white px-3 py-2 text-left">
										<div className="mb-1 text-xs text-gray-500">
											{half}
										</div>
										<TeamDropdown
											teams={teams}
											value={side}
											ariaLabel={`Team batting in the ${half.toLowerCase()} of each inning`}
											onChange={(chosen) =>
												// Picking a team for one half puts the other team in the other half
												onTopSideChange(
													half === "Top"
														? chosen
														: chosen === "team"
															? "opponent"
															: "team",
												)
											}
										/>
									</td>

									{inningRuns[side].map((runs, index) => (
										<td key={index} className="px-1 py-2">
											<input
												type="number"
												min="0"
												inputMode="numeric"
												aria-label={`${team?.name ?? side} runs, ${half.toLowerCase()} of inning ${index + 1}`}
												value={runs ?? ""}
												placeholder="X"
												onFocus={(e) =>
													e.target.select()
												}
												onChange={(e) => {
													const raw = e.target.value;

													// Empty = inning not played
													const value =
														raw === ""
															? null
															: Math.max(
																	0,
																	Math.floor(
																		Number(
																			raw,
																		),
																	) || 0,
																);

													onRunsChange(
														side,
														index,
														value,
													);
												}}
												className="h-9 w-10 rounded-md border border-gray-200 text-center text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-300 [appearance:textfield] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
											/>
										</td>
									))}

									<td className="border-l border-gray-200 px-4 py-2 text-base font-bold text-gray-900">
										{sumRuns(inningRuns[side])}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-3 flex items-center justify-between gap-3">
				<span className="text-xs text-gray-500">
					{inningCount} {inningCount === 1 ? "inning" : "innings"}
				</span>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={onRemoveInning}
						disabled={inningCount <= 1}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Remove inning
					</button>

					<button
						type="button"
						onClick={onAddInning}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
					>
						Add inning
					</button>
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Team Logo                                                                   */
/* -------------------------------------------------------------------------- */

function TeamLogo({ team }: { team: AdminGameDto["team"] | undefined }) {
	return (
		<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
			{team?.logo ? (
				<img
					src={team.logo}
					alt=""
					className="h-full w-full object-contain"
				/>
			) : (
				<span className="text-[10px] font-semibold text-gray-500">
					{team?.abbreviation}
				</span>
			)}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Team Dropdown                                                               */
/* -------------------------------------------------------------------------- */

type TeamDropdownProps = {
	teams: Record<Side, AdminGameDto["team"] | undefined>;
	value: Side;
	onChange: (side: Side) => void;
	ariaLabel: string;
};

function TeamDropdown({
	teams,
	value,
	onChange,
	ariaLabel,
}: TeamDropdownProps) {
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const selectedTeam = teams[value];

	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;

			if (
				buttonRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}

			setOpen(false);
		};

		const close = () => setOpen(false);

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("resize", close);
		window.addEventListener("scroll", close, true);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("resize", close);
			window.removeEventListener("scroll", close, true);
		};
	}, [open]);

	const toggle = () => {
		if (!open && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();

			setPosition({
				top: rect.bottom + 4,
				left: rect.left,
				width: Math.max(rect.width, 208),
			});
		}

		setOpen((current) => !current);
	};

	const handleSelect = (side: Side) => {
		onChange(side);
		setOpen(false);
	};

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={toggle}
				className="flex w-full min-w-[9rem] items-center justify-between rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-2.5 text-left text-sm font-semibold text-gray-900 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
			>
				<div className="flex min-w-0 items-center gap-2">
					<TeamLogo team={selectedTeam} />

					<span className="truncate">
						{selectedTeam?.abbreviation ?? selectedTeam?.name}
					</span>
				</div>

				<ChevronDown
					className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{/* Rendered in a portal so the table's horizontal scroll area doesn't clip it */}
			{open &&
				createPortal(
					<div
						ref={menuRef}
						role="listbox"
						style={{
							position: "fixed",
							top: position.top,
							left: position.left,
							width: position.width,
						}}
						className="z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
					>
						{(["team", "opponent"] as Side[]).map((side) => {
							const team = teams[side];
							const isSelected = side === value;

							return (
								<button
									key={side}
									type="button"
									role="option"
									aria-selected={isSelected}
									onClick={() => handleSelect(side)}
									className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
										isSelected
											? "bg-blue-50 text-blue-700"
											: "text-gray-900"
									}`}
								>
									<TeamLogo team={team} />

									<span className="flex-1 truncate">
										{team?.name ?? team?.abbreviation}
									</span>

									{isSelected && (
										<Check className="h-4 w-4 text-blue-600" />
									)}
								</button>
							);
						})}
					</div>,
					document.body,
				)}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Team Score                                                                  */
/* -------------------------------------------------------------------------- */

type TeamScoreProps = {
	team: AdminGameDto["team"];
	score: number;
	onScoreChange: Dispatch<SetStateAction<number>>;
};

function TeamScore({ team, score, onScoreChange }: TeamScoreProps) {
	if (!team) return null;

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
				{team.logo ? (
					<img
						src={team.logo}
						alt={`${team.name} logo`}
						className="h-full w-full object-contain"
					/>
				) : (
					<span className="text-xs font-semibold text-gray-500">
						{team.abbreviation}
					</span>
				)}
			</div>

			<div className="text-center">
				<div className="font-semibold text-gray-900">{team.name}</div>

				<div className="text-xs text-gray-500">{team.abbreviation}</div>
			</div>

			<input
				type="number"
				min="0"
				value={score}
				onChange={(e) => {
					const value = Math.max(0, Number(e.target.value));

					onScoreChange(value);
				}}
				className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
			/>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Stadium Time                                                                */
/* -------------------------------------------------------------------------- */

type StadiumTimeSelectorProps = {
	value: "Day" | "Night";
	onChange: (value: "Day" | "Night") => void;
};

function StadiumTimeSelector({ value, onChange }: StadiumTimeSelectorProps) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm font-medium text-gray-700">
				Stadium Time
			</span>

			<div className="flex h-[42px] rounded-lg border border-gray-300 bg-gray-50 p-1">
				<button
					type="button"
					onClick={() => onChange("Day")}
					className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${
						value === "Day"
							? "bg-white text-amber-600 shadow-sm"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<Sun className="h-4 w-4" />
					Day
				</button>

				<button
					type="button"
					onClick={() => onChange("Night")}
					className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition ${
						value === "Night"
							? "bg-white text-indigo-600 shadow-sm"
							: "text-gray-500 hover:text-gray-700"
					}`}
				>
					<Moon className="h-4 w-4" />
					Night
				</button>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Stadium Time Badge                                                          */
/* -------------------------------------------------------------------------- */

type StadiumTimeBadgeProps = {
	value: "Day" | "Night";
};

function StadiumTimeBadge({ value }: StadiumTimeBadgeProps) {
	const isDay = value === "Day";

	return (
		<div
			className={`flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm ${
				isDay ? "text-amber-600" : "text-indigo-600"
			}`}
		>
			{isDay ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}

			{value}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Stadium Dropdown                                                            */
/* -------------------------------------------------------------------------- */

type StadiumDropdownProps = {
	label: string;
	stadiums: StadiumDto[];
	value: string | null;
	onChange: (value: string | null) => void;
	noneLabel?: string;
};

function StadiumDropdown({
	label,
	stadiums,
	value,
	onChange,
	noneLabel = "Select stadium",
}: StadiumDropdownProps) {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedStadium = stadiums.find(
		(stadium) => stadium.stadiumId === value,
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSelect = (stadiumId: string | null) => {
		onChange(stadiumId);
		setOpen(false);
	};

	return (
		<div ref={dropdownRef} className="relative flex flex-col gap-2">
			<span className="text-sm font-medium text-gray-700">{label}</span>

			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm text-gray-900 outline-none transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
			>
				{selectedStadium ? (
					<div className="flex min-w-0 items-center gap-2">
						<StadiumIcon stadium={selectedStadium} size="sm" />

						<span className="truncate">{selectedStadium.name}</span>
					</div>
				) : (
					<span className="text-gray-400">{noneLabel}</span>
				)}

				<ChevronDown
					className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{open && (
				<div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
					{/* None option */}
					{noneLabel === "None" && (
						<button
							type="button"
							onClick={() => handleSelect(null)}
							className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
								value === null ? "bg-gray-50 font-medium" : ""
							}`}
						>
							<span className="text-gray-500">None</span>

							{value === null && (
								<Check className="ml-auto h-4 w-4 text-blue-600" />
							)}
						</button>
					)}

					{stadiums.map((stadium) => {
						const isSelected = stadium.stadiumId === value;

						return (
							<button
								key={stadium.stadiumId}
								type="button"
								onClick={() => handleSelect(stadium.stadiumId)}
								className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
									isSelected
										? "bg-blue-50 text-blue-700"
										: "text-gray-900"
								}`}
							>
								<StadiumIcon stadium={stadium} size="sm" />

								<span className="flex-1 truncate">
									{stadium.name}
								</span>

								{isSelected && (
									<Check className="h-4 w-4 text-blue-600" />
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Stadium Icon                                                                */
/* -------------------------------------------------------------------------- */

type StadiumIconProps = {
	stadium: StadiumDto;
	size?: "sm" | "md";
};

function StadiumIcon({ stadium, size = "md" }: StadiumIconProps) {
	const sizeClasses = size === "sm" ? "h-8 w-12" : "h-10 w-16";

	return (
		<div
			className={`${sizeClasses} flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100`}
		>
			{stadium.icon ? (
				<img
					src={stadium.icon}
					alt=""
					className="h-full w-full object-contain"
				/>
			) : (
				<svg
					className="h-5 w-5 text-gray-400"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 21h18"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5 21V9l7-5 7 5v12"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 21v-5h6v5"
					/>
				</svg>
			)}
		</div>
	);
}
