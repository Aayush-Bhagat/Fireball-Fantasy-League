import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import NavBar from "@/components/navBar";
import { createClient } from "@/lib/supabase/server";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Fireball League",
	description: "Fireball Fantasy League",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: role }: { data: { role: string } | null } = await supabase
		.from("user_roles")
		.select("role")
		.eq("id", user?.id)
		.single();

	const isLoggedIn = !!user;

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryProvider>
					<NavBar
						isLoggedIn={isLoggedIn}
						role={role?.role || "team"}
					/>
					{children}
				</QueryProvider>
			</body>
		</html>
	);
}
