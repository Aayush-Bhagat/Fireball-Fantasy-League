import { NextRequest } from "next/server";
import { getTeamById } from "@/services/teamService";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await params;

	if (!teamId) {
		return new Response("Team ID is required", { status: 400 });
	}

	try {
		const team = await getTeamById(teamId as string);

		if (!team) {
			return new Response("Team not found", { status: 404 });
		}

		return new Response(JSON.stringify(team), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching team:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
