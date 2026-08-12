import { computePairOdds } from "@/services/oddsService";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/seasons/[season]/odds?teamA=<id>&teamB=<id>
 *
 * Returns win probabilities / moneylines for a hypothetical matchup between
 * the two teams, computed from season-to-date aggregates (all completed
 * games in the season so far). `season` may be a numeric id or "current".
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ season: string }> }
) {
	try {
		const { season } = await params;

		const teamAId = req.nextUrl.searchParams.get("teamA");
		const teamBId = req.nextUrl.searchParams.get("teamB");

		if (!teamAId || !teamBId) {
			return NextResponse.json(
				{ error: "Both teamA and teamB query parameters are required." },
				{ status: 400 }
			);
		}
		if (teamAId === teamBId) {
			return NextResponse.json(
				{ error: "teamA and teamB must be different." },
				{ status: 400 }
			);
		}

		if (season !== "current" && isNaN(Number(season))) {
			return NextResponse.json(
				{ error: "Invalid season." },
				{ status: 400 }
			);
		}

		const seasonId = season === "current" ? null : parseInt(season);

		const result = await computePairOdds(seasonId, teamAId, teamBId);

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error computing pair odds:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
