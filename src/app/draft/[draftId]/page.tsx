import DraftBoard from "@/components/draft/draftBoard";
import { createClient } from "@/lib/supabase/server";
import { getDraftRequest } from "@/requests/draft";
import { viewAllPlayers } from "@/requests/players";
import { redirect } from "next/navigation";

export default async function DraftPage({
	params,
}: {
	params: Promise<{ draftId: string }>;
}) {
	const supabase = await createClient();

	const { draftId } = await params;

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

	const { players } = await viewAllPlayers();

	const { draft, teamId } = await getDraftRequest(draftId, token);

	return (
		<div className="pt-16">
			<DraftBoard players={players} draftData={draft} teamId={teamId} />
		</div>
	);
}
