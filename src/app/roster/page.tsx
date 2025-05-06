import { Button } from "@/components/ui/button";
import { getUserTeamById, getUserTeamRoster } from "@/requests/teams";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeamInfo from "@/components/teamInfo";
import TeamInfoSkeleton from "@/components/loaders/TeamInfoSkeleton";
import { Suspense } from "react";
import TeamRosterSkeleton from "@/components/loaders/TeamRosterSkeleton";
import TeamRoster from "@/components/teamRoster";

export default async function Roster() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const token = await supabase.auth
		.getSession()
		.then(({ data }) => data.session?.access_token);

	if (!token) {
		redirect("/login");
	}

	const teamInfo = getUserTeamById(token);
	const roster = getUserTeamRoster(token);
	return (
		<>
			<div className="min-h-screen bg-gray-100 font-sans pt-20 pb-20">
				<Suspense fallback={<TeamInfoSkeleton />}>
					<TeamInfo teamData={teamInfo} />
				</Suspense>
				{/* Buttons */}
				<div className="flex gap-3 justify-center mb-4">
					<Link href="/editLineup">
						<Button className="bg-blue-600 text-white hover:bg-blue-700">
							Edit Lineup
						</Button>
					</Link>
					<Link href="/trade">
						<Button className="bg-green-500 text-white hover:bg-green-600">
							Trade
						</Button>
					</Link>
				</div>

				<Suspense fallback={<TeamRosterSkeleton />}>
					<TeamRoster rosterData={roster} />
				</Suspense>

				{/* Roster Table */}
			</div>
		</>
	);
}
