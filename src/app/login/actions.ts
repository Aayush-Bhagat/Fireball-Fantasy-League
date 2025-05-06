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

	revalidatePath("/");
	redirect("/roster");
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();

	revalidatePath("/");
}
