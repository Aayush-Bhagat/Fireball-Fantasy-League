import { getAllTeams } from "@/services/teamService";

export async function GET(request: Request) {
	const teams = await getAllTeams();
	return new Response(JSON.stringify(teams), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}
