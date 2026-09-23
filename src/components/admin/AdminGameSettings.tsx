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
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { updateGameScore } from "@/requests/games";

type GameSettingsValues = {
	stadiumId: string | null;
	stadiumTime: "Day" | "Night";
	bannedStadiumId: string | null;
};

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

	const updateValue = <K extends keyof GameSettingsValues>(
		key: K,
		value: GameSettingsValues[K],
	) => {
		setValues((current) => ({
			...current,
			[key]: value,
		}));
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
