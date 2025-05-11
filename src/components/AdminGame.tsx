"use client";

import { AdminGameDto, UpdateGameRequestDto } from "@/dtos/gameDtos";
import { use, useEffect, useState } from "react";
import PlayGameTable from "@/components/PlayGameTable";
import playerStatsReducer, {
	initialPlayerStatsState,
	PlayerStats,
} from "@/components/hooks/playerStatsReducer";
import { useReducer } from "react";
import AdminNumberField from "@/components/ui/numberInput";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { updateGame } from "@/requests/games";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
	gameData: Promise<AdminGameDto>;
};

export default function AdminGame({ gameData }: Props) {
	const game = use(gameData);
	const supabase = createClient();

	const [teamPlayerStats, dispatch] = useReducer(
		playerStatsReducer,
		initialPlayerStatsState(game.teamRoster)
	);

	const [opponentPlayerStats, dispatchOpponent] = useReducer(
		playerStatsReducer,
		initialPlayerStatsState(game.opponentRoster)
	);

	const [teamScore, setTeamScore] = useState(0);
	const [opponentScore, setOpponentScore] = useState(0);

	// Load saved data from localStorage after component mounts (client-side only)
	useEffect(() => {
		const savedTeamStats = sessionStorage.getItem(
			`teamPlayerStats-${game.gameId}`
		);
		const savedOpponentStats = sessionStorage.getItem(
			`opponentPlayerStats-${game.gameId}`
		);

		const savedTeamScore = sessionStorage.getItem(
			`teamScore-${game.gameId}`
		);
		const savedOpponentScore = sessionStorage.getItem(
			`opponentScore-${game.gameId}`
		);

		if (savedTeamStats) {
			const parsedStats = JSON.parse(savedTeamStats) as PlayerStats[];
			dispatch({ type: "REPLACE_ALL", payload: parsedStats });
		}

		if (savedOpponentStats) {
			const parsedStats = JSON.parse(savedOpponentStats) as PlayerStats[];
			dispatchOpponent({ type: "REPLACE_ALL", payload: parsedStats });
		}

		if (savedTeamScore) {
			setTeamScore(parseInt(savedTeamScore));
		}

		if (savedOpponentScore) {
			setOpponentScore(parseInt(savedOpponentScore));
		}
	}, [game.gameId]);

	useEffect(() => {
		sessionStorage.setItem(
			`teamScore-${game.gameId}`,
			teamScore.toString()
		);
		sessionStorage.setItem(
			`opponentScore-${game.gameId}`,
			opponentScore.toString()
		);
	}, [teamScore, opponentScore, game.gameId]);

	// Save data to localStorage when it changes
	useEffect(() => {
		sessionStorage.setItem(
			`teamPlayerStats-${game.gameId}`,
			JSON.stringify(teamPlayerStats)
		);
		sessionStorage.setItem(
			`opponentPlayerStats-${game.gameId}`,
			JSON.stringify(opponentPlayerStats)
		);
	}, [teamPlayerStats, opponentPlayerStats, game.gameId]);

	const { mutate: updateGameMutation, isPending } = useMutation({
		mutationFn: async () => {
			await supabase.auth.getUser();

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error("No session found");
			}

			const accessToken = session.access_token;

			const updateGameRequest: UpdateGameRequestDto = {
				gameId: game.gameId,
				teamScore: teamScore,
				opponentScore: opponentScore,
				teamPlayers: teamPlayerStats,
				opponentPlayers: opponentPlayerStats,
				teamId: game.team.id,
				opponentId: game.opponent.id,
			};

			await updateGame(updateGameRequest, accessToken);
		},
	});

	return (
		<div className="pt-20 px-6 max-w-full mx-auto">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-3xl font-bold mb-10 text-center">
					Admin Game
				</h1>
				<div className="mb-12 flex flex-row gap-4">
					<Button
						className="py-5 bg-violet-600 text-white hover:bg-violet-700"
						onClick={() => updateGameMutation()}
					>
						{isPending && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						)}
						{isPending ? "Submitting..." : "Submit Game"}
					</Button>
				</div>
			</div>

			<div className="mb-12">
				<div className="flex flex-row items-center gap-2 mb-4">
					<div>
						{game.team.logo && (
							<img
								src={game.team.logo}
								alt={game.team.name}
								className="w-12 h-12 rounded-full border border-gray-300"
							/>
						)}
					</div>
					<h2 className="text-2xl font-bold text-black">
						{game.team.name}
					</h2>
					<div className="flex flex-row items-center gap-2">
						<div>Score:</div>
						<AdminNumberField
							onChange={(value) => setTeamScore(value)}
							value={teamScore}
						/>
					</div>
				</div>
				<PlayGameTable
					roster={teamPlayerStats}
					color="red"
					dispatch={dispatch}
				/>
			</div>

			<div>
				<div className="flex flex-row items-center gap-2 mb-4">
					<div>
						{game.opponent.logo && (
							<img
								src={game.opponent.logo}
								alt={game.opponent.name}
								className="w-12 h-12 rounded-full border border-gray-300"
							/>
						)}
					</div>
					<h2 className="text-2xl font-bold text-black">
						{game.opponent.name}
					</h2>
					<div className="flex flex-row items-center gap-2">
						<div>Score:</div>
						<AdminNumberField
							onChange={(value) => setOpponentScore(value)}
							value={opponentScore}
						/>
					</div>
				</div>
				<PlayGameTable
					roster={opponentPlayerStats}
					color="blue"
					dispatch={dispatchOpponent}
				/>
			</div>
		</div>
	);
}
