import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SeasonScheduleResponseDto } from "@/dtos/gameDtos";
import { StandingsDto } from "@/dtos/teamDtos";
import { PlayerStatsResponseDto } from "@/dtos/playerDtos";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    standingsData: Promise<StandingsDto>;
    scheduleData: Promise<SeasonScheduleResponseDto>;
    playersData: Promise<PlayerStatsResponseDto>;
};

type Team = StandingsDto["western"][number];

type TeamStats = Team & {
    gamesPlayed: number;
    winningPct: number;
    runsFor: number;
    runsAgainst: number;
    runDifferential: number;
    gamesBack: number;
    homeRuns: number;
};

const TOTAL_GAMES = 10;
const PLAYOFF_SPOTS = 3;

export default async function FullStandings({
    standingsData,
    scheduleData,
    playersData,
}: Props) {
    const standings = await standingsData;
    const schedule = await scheduleData;
    const playersResponse = await playersData;

    const players = playersResponse.players;

    /* ============================================================
       ALL GAMES
    ============================================================ */

    const allGames = schedule.schedule.flatMap((week) => week.games);

    /* ============================================================
       TEAM HOME RUNS
    ============================================================ */

    function calculateTeamHomeRuns(teamId: string): number {
        return players
            .filter((player) => player.teamId === teamId)
            .reduce((total, player) => {
                return total + (player.stats.homeRuns ?? 0);
            }, 0);
    }

    /* ============================================================
       TEAM STATISTICS
    ============================================================ */

    function calculateTeamStats(team: Team): TeamStats {
        let runsFor = 0;
        let runsAgainst = 0;

        const teamGames = allGames.filter(
            (game) => game.team.id === team.id || game.opponent.id === team.id,
        );

        for (const game of teamGames) {
            if (game.team.id === team.id) {
                runsFor += game.teamScore ?? 0;
                runsAgainst += game.opponentScore ?? 0;
            } else {
                runsFor += game.opponentScore ?? 0;
                runsAgainst += game.teamScore ?? 0;
            }
        }

        const gamesPlayed = team.wins + team.losses + team.ties;

        const winningPct = gamesPlayed === 0 ? 0 : team.wins / gamesPlayed;

        const homeRuns = calculateTeamHomeRuns(team.id);

        return {
            ...team,
            gamesPlayed,
            winningPct,
            runsFor,
            runsAgainst,
            runDifferential: runsFor - runsAgainst,
            gamesBack: 0,
            homeRuns,
        };
    }

    /* ============================================================
       SORT TEAMS
    ============================================================ */

    function sortTeams(teams: Team[]): TeamStats[] {
        const stats = teams.map(calculateTeamStats);

        stats.sort((a, b) => {
            if (b.winningPct !== a.winningPct) {
                return b.winningPct - a.winningPct;
            }

            if (b.runDifferential !== a.runDifferential) {
                return b.runDifferential - a.runDifferential;
            }

            return b.runsFor - a.runsFor;
        });

        if (stats.length > 0) {
            const leader = stats[0];

            for (const team of stats) {
                team.gamesBack =
                    (leader.wins - team.wins + team.losses - leader.losses) / 2;
            }
        }

        return stats;
    }

    const westernTeams = sortTeams(standings.western);
    const easternTeams = sortTeams(standings.eastern);

    const allTeams = [...westernTeams, ...easternTeams];

    /* ============================================================
       CLINCH LOGIC
    ============================================================ */

    function getClinchStatus(
        team: TeamStats,
        conferenceTeams: TeamStats[],
    ): "Z" | "X" | "" {
        const gamesRemaining = (t: TeamStats) => TOTAL_GAMES - t.gamesPlayed;

        const maxWins = (t: TeamStats) => t.wins + gamesRemaining(t);

        let teamsThatCanTieOrBeat = 0;

        for (const other of conferenceTeams) {
            if (other.id === team.id) {
                continue;
            }

            if (maxWins(other) >= team.wins) {
                teamsThatCanTieOrBeat++;
            }
        }

        const clinchedPlayoffs = teamsThatCanTieOrBeat < PLAYOFF_SPOTS;

        let clinchedBye = true;

        for (const other of conferenceTeams) {
            if (other.id === team.id) {
                continue;
            }

            if (maxWins(other) >= team.wins) {
                clinchedBye = false;
                break;
            }
        }

        if (clinchedBye) {
            return "Z";
        }

        if (clinchedPlayoffs) {
            return "X";
        }

        return "";
    }

    /* ============================================================
       TEAM LOGO
    ============================================================ */

    function TeamLogo({
        team,
        size = "md",
    }: {
        team: TeamStats;
        size?: "sm" | "md" | "lg";
    }) {
        const sizeClass =
            size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";

        if (team.logo) {
            return (
                <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className={`${sizeClass} shrink-0 rounded-full object-cover`}
                />
            );
        }

        return (
            <div
                className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gray-100`}
            >
                <span className="text-xs font-bold text-gray-400">
                    {team.name.charAt(0)}
                </span>
            </div>
        );
    }

    /* ============================================================
       STANDINGS TABLE
    ============================================================ */

    function StandingsTable({
        teams,
        conference,
    }: {
        teams: TeamStats[];
        conference: string;
    }) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {conference} Conference
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {teams.length} teams
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Playoffs
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Bye
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                <th className="w-[32%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Team
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    GP
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    W
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    L
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    T
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    PCT
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    GB
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RF
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RA
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RD
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {teams.map((team, index) => {
                                const clinch = getClinchStatus(team, teams);

                                const playoffSpot = index < PLAYOFF_SPOTS;

                                return (
                                    <tr
                                        key={team.id}
                                        className="group border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/teams/${team.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <span
                                                    className={`w-5 text-center text-xs font-bold ${
                                                        playoffSpot
                                                            ? "text-gray-700"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </span>

                                                <TeamLogo team={team} />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate font-semibold text-gray-900 transition-colors group-hover:text-violet-700">
                                                            {team.name}
                                                        </span>

                                                        {clinch === "Z" && (
                                                            <span className="hidden rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700 sm:inline-flex">
                                                                Z
                                                            </span>
                                                        )}

                                                        {clinch === "X" && (
                                                            <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:inline-flex">
                                                                X
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>

                                        <td className="px-2 py-4 text-center font-medium text-gray-600">
                                            {team.gamesPlayed}
                                        </td>

                                        <td className="px-2 py-4 text-center font-bold text-gray-900">
                                            {team.wins}
                                        </td>

                                        <td className="px-2 py-4 text-center text-gray-600">
                                            {team.losses}
                                        </td>

                                        <td className="px-2 py-4 text-center text-gray-600">
                                            {team.ties}
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span className="rounded-md bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                                                {team.winningPct.toFixed(3)}
                                            </span>
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs text-gray-600">
                                            {team.gamesBack === 0
                                                ? "—"
                                                : team.gamesBack.toFixed(1)}
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs font-semibold text-gray-700">
                                            {team.runsFor}
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs font-semibold text-gray-700">
                                            {team.runsAgainst}
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span
                                                className={`inline-flex min-w-[45px] justify-center rounded-md px-2 py-1 font-mono text-xs font-bold ${
                                                    team.runDifferential > 0
                                                        ? "bg-green-50 text-green-700"
                                                        : team.runDifferential <
                                                            0
                                                          ? "bg-red-50 text-red-600"
                                                          : "bg-gray-50 text-gray-600"
                                                }`}
                                            >
                                                {team.runDifferential > 0
                                                    ? `+${team.runDifferential}`
                                                    : team.runDifferential}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-green-200 bg-green-50 px-1 font-bold text-green-700">
                                Z
                            </span>
                            First Round Bye
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-1 font-bold text-blue-700">
                                X
                            </span>
                            Playoffs Clinched
                        </span>
                        <span>
                            <strong className="text-gray-500">GP</strong> Games
                            Played
                        </span>

                        <span>
                            <strong className="text-gray-500">PCT</strong>{" "}
                            Winning Percentage
                        </span>

                        <span>
                            <strong className="text-gray-500">GB</strong> Games
                            Behind
                        </span>

                        <span>
                            <strong className="text-gray-500">RF</strong> Runs
                            For
                        </span>

                        <span>
                            <strong className="text-gray-500">RA</strong> Runs
                            Allowed
                        </span>

                        <span>
                            <strong className="text-gray-500">RD</strong> Run
                            Differential
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* ============================================================
       LEAGUE TABLE
    ============================================================ */

    function LeagueTable() {
        const sortedLeague = [...allTeams].sort((a, b) => {
            if (b.winningPct !== a.winningPct) {
                return b.winningPct - a.winningPct;
            }

            if (b.runDifferential !== a.runDifferential) {
                return b.runDifferential - a.runDifferential;
            }

            return b.runsFor - a.runsFor;
        });

        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            League Statistics
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            All teams across the league
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70">
                                <th className="w-[25%] px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Team
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    GP
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    W
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    L
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    T
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    PCT
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RF
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RA
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RD
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    HR
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    Runs/G
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    HR/G
                                </th>

                                <th className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    RD/G
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedLeague.map((team, index) => {
                                const runsPerGame =
                                    team.runsFor /
                                    Math.max(team.gamesPlayed, 1);

                                const homeRunsPerGame =
                                    team.homeRuns /
                                    Math.max(team.gamesPlayed, 1);

                                const diffPerGame =
                                    team.runDifferential /
                                    Math.max(team.gamesPlayed, 1);

                                return (
                                    <tr
                                        key={team.id}
                                        className="group border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <Link
                                                href={`/teams/${team.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-5 text-center text-xs font-bold text-gray-400">
                                                    {index + 1}
                                                </span>

                                                <TeamLogo
                                                    team={team}
                                                    size="sm"
                                                />

                                                <div className="min-w-0">
                                                    <span className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-violet-700">
                                                        {team.name}
                                                    </span>

                                                    <p className="text-[10px] text-gray-400">
                                                        {team.wins}-
                                                        {team.losses}-
                                                        {team.ties}
                                                    </p>
                                                </div>
                                            </Link>
                                        </td>

                                        <td className="px-2 py-4 text-center text-xs text-gray-600">
                                            {team.gamesPlayed}
                                        </td>

                                        <td className="px-2 py-4 text-center font-bold text-gray-900">
                                            {team.wins}
                                        </td>

                                        <td className="px-2 py-4 text-center text-gray-600">
                                            {team.losses}
                                        </td>

                                        <td className="px-2 py-4 text-center text-gray-600">
                                            {team.ties}
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span className="rounded-md bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                                                {team.winningPct.toFixed(3)}
                                            </span>
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs font-bold text-gray-800">
                                            {team.runsFor}
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs font-bold text-gray-800">
                                            {team.runsAgainst}
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span
                                                className={`font-mono text-xs font-bold ${
                                                    team.runDifferential > 0
                                                        ? "text-green-600"
                                                        : team.runDifferential <
                                                            0
                                                          ? "text-red-500"
                                                          : "text-gray-500"
                                                }`}
                                            >
                                                {team.runDifferential > 0
                                                    ? `+${team.runDifferential}`
                                                    : team.runDifferential}
                                            </span>
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span className="inline-flex min-w-[35px] justify-center rounded-md bg-violet-50 px-2 py-1 font-mono text-xs font-bold text-violet-700">
                                                {team.homeRuns}
                                            </span>
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs text-gray-600">
                                            {runsPerGame.toFixed(1)}
                                        </td>

                                        <td className="px-2 py-4 text-center font-mono text-xs text-gray-600">
                                            {homeRunsPerGame.toFixed(2)}
                                        </td>

                                        <td className="px-2 py-4 text-center">
                                            <span
                                                className={`font-mono text-xs font-bold ${
                                                    diffPerGame > 0
                                                        ? "text-green-600"
                                                        : diffPerGame < 0
                                                          ? "text-red-500"
                                                          : "text-gray-500"
                                                }`}
                                            >
                                                {diffPerGame > 0 ? "+" : ""}
                                                {diffPerGame.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-gray-400">
                        <span>
                            <strong className="text-gray-500">GP</strong> Games
                            Played
                        </span>

                        <span>
                            <strong className="text-gray-500">RF</strong> Runs
                            For
                        </span>

                        <span>
                            <strong className="text-gray-500">RA</strong> Runs
                            Allowed
                        </span>

                        <span>
                            <strong className="text-gray-500">RD</strong> Run
                            Differential
                        </span>

                        <span>
                            <strong className="text-gray-500">HR</strong> Home
                            Runs
                        </span>

                        <span>
                            <strong className="text-gray-500">Runs/G</strong>{" "}
                            Runs Per Game
                        </span>

                        <span>
                            <strong className="text-gray-500">HR/G</strong> Home
                            Runs Per Game
                        </span>

                        <span>
                            <strong className="text-gray-500">RD/G</strong> Run
                            Differential Per Game
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    /* ============================================================
       PAGE UI
    ============================================================ */

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}

                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
                            <Link
                                href="/"
                                className="transition-colors hover:text-violet-600"
                            >
                                Home
                            </Link>

                            <ChevronRight className="h-3 w-3" />

                            <span>Standings</span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                            Standings
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-gray-500">
                            Follow the league race, team records, scoring, home
                            runs, and playoff picture throughout the season.
                        </p>
                    </div>
                </div>

                {/* Main Tabs */}

                <section>
                    <Tabs defaultValue="western" className="w-full">
                        <div className="mb-5 flex justify-center sm:justify-start">
                            <TabsList className="grid h-11 w-full max-w-lg grid-cols-3 rounded-xl bg-gray-200/70 p-1">
                                <TabsTrigger
                                    value="western"
                                    className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Western
                                </TabsTrigger>

                                <TabsTrigger
                                    value="eastern"
                                    className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Eastern
                                </TabsTrigger>

                                <TabsTrigger
                                    value="league"
                                    className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    League
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="western" className="mt-0">
                            <StandingsTable
                                teams={westernTeams}
                                conference="Western"
                            />
                        </TabsContent>

                        <TabsContent value="eastern" className="mt-0">
                            <StandingsTable
                                teams={easternTeams}
                                conference="Eastern"
                            />
                        </TabsContent>

                        <TabsContent value="league" className="mt-0">
                            <LeagueTable />
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </main>
    );
}
