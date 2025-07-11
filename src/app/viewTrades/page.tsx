import ViewTeamTrades from "@/components/trades/viewTeamTrades";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function viewTrades() {
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

	return (
		<div>
			<ViewTeamTrades />
		</div>
	);
}
