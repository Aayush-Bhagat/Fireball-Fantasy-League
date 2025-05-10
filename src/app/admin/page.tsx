import TeamSchedule from "@/components/teamSchedule";
import { getWeeklySchedule } from "@/requests/schedule";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TeamScheduleSkeleton from "@/components/loaders/TeamScheduleSkeleton";

export default async function Page() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const { data: role }: { data: { role: string } | null } = await supabase
		.from("user_roles")
		.select("role")
		.eq("id", user?.id)
		.single();

	if (role?.role !== "admin") {
		redirect("/");
	}

	const teamSchedule = getWeeklySchedule(null, "current");

	return (
		<div className="pt-20 px-6 max-w-full mx-auto">
			<Suspense fallback={<TeamScheduleSkeleton count={4} />}>
				<TeamSchedule teamSchedule={teamSchedule} isAdmin={true} />
			</Suspense>
		</div>
	);
}
