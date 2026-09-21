import FullStandings from "@/components/fullStandings";
import { getStandings } from "@/requests/standings";
import { viewAllPlayers } from "@/requests/players";
import { getSeasonSchedule } from "@/services/gameService";

export default async function StandingsPage() {
    const standingsData = getStandings("current");
    const scheduleData = getSeasonSchedule("current");
    const playersData = viewAllPlayers();

    return (
        <FullStandings
            standingsData={standingsData}
            scheduleData={scheduleData}
            playersData={playersData}
        />
    );
}
