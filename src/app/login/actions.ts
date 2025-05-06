"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
	const supabase = await createClient();

	const authData = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signInWithPassword(authData);

	if (error) {
		throw new Error(error.message);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: role }: { data: { role: string } | null } = await supabase
		.from("user_roles")
		.select("role")
		.eq("id", user?.id)
		.single();

	if (role?.role === "admin") {
		revalidatePath("/");
		redirect("/admin");
	} else {
		revalidatePath("/");
		redirect("/roster");
	}
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();

	revalidatePath("/");
}
