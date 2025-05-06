"use client";
import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/app/login/actions";
import Link from "next/link";
type Props = {
	isLoggedIn: boolean;
};

export default function NavBar({ isLoggedIn }: Props) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [nestedDropdownOpen] = useState(false);
	return (
		<nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
			<div className="flex items-center justify-between w-full p-4 md:px-6">
				<Link href="/" className="flex items-center space-x-3">
					<img src="/images/blooper.png" alt="Logo" className="h-8" />
					<span className="text-2xl font-semibold dark:text-white">
						Fireball League
					</span>
				</Link>

				{/* Mobile Menu Button */}
				<button
					onClick={() => setMenuOpen(!menuOpen)}
					className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
					aria-label="Toggle Menu"
				>
					<Menu className="w-5 h-5" />
				</button>

				{/* Navigation Links */}
				<div
					className={`w-full md:w-auto ${
						menuOpen ? "block" : "hidden"
					} md:block`}
				>
					<ul className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0 text-gray-900 dark:text-white">
						<li>
							<Link
								href="/"
								className="hover:text-blue-600 dark:hover:text-blue-400"
							>
								Schedule
							</Link>
						</li>

						{/* Dropdown Menu */}

						<li className="relative">
							<button
								onClick={() => setDropdownOpen(!dropdownOpen)}
								className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
							>
								My Team <ChevronDown className="w-4 h-4" />
							</button>

							{dropdownOpen && (
								<div className="absolute z-20 mt-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 w-44">
									<Link
										href="/roster"
										className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Roster
									</Link>

									{/* Nested Dropdown */}
									<Link
										href="/editLineup"
										className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Lineup
									</Link>

									<Link
										href="/trade"
										className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Trades
									</Link>
								</div>
							)}
						</li>

						<li>
							{!isLoggedIn && (
								<Link
									href="/login"
									className="hover:text-blue-600 dark:hover:text-blue-400"
								>
									Log In
								</Link>
							)}
							{isLoggedIn && (
								<Button
									className="hover:bg-slate-900"
									onClick={() => logout()}
								>
									Log Out
								</Button>
							)}
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
