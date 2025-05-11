import React from "react";
import AdminGame from "@/components/AdminGame";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminGame } from "@/requests/admin";
import { Suspense } from "react";
import AdminGameSkeleton from "@/components/loaders/AdminGameSkelton";

export default async function page({
	params,
}: {
	params: Promise<{ game: string }>;
}) {
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

	const token = (await supabase.auth.getSession()).data.session?.access_token;

	if (!token) {
		redirect("/login");
	}

	const { game } = await params;

	const gameData = getAdminGame(game, token);

	return (
		<>
			<Suspense fallback={<AdminGameSkeleton />}>
				<AdminGame gameData={gameData} />
			</Suspense>
		</>
	);
}
