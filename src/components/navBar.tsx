"use client";
import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/app/login/actions";
import Link from "next/link";
type Props = {
    isLoggedIn: boolean;
    role: string;
};

export default function NavBar({ isLoggedIn, role }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [nestedDropdownOpen] = useState(false);

    // Close dropdown when menu closes
    const toggleMenu = () => {
        if (menuOpen && dropdownOpen) {
            setDropdownOpen(false);
        }
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between w-full p-4 md:px-6">
                <Link href="/" className="flex items-center space-x-3">
                    <img src="/images/blooper.png" alt="Logo" className="h-8" />
                    <span className="text-2xl font-semibold dark:text-white">
                        Fireball League
                    </span>
                </Link>
                {/* Navigation Links */}
                {/* <div
                    className={`w-full md:w-auto ${
                        menuOpen ? "block" : "hidden"
                    } md:block`}
                >
                    <ul className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0 text-gray-900 dark:text-white">
                        <li>
                            <Link
                                href="/schedule"
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Schedule
                            </Link>
                        </li>
                    </ul>
                </div> */}
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Toggle Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Navigation Links */}
                <div
                    className={`${
                        menuOpen
                            ? "absolute top-full left-0 right-0 border-b border-gray-200 dark:border-gray-700"
                            : "hidden"
                    } md:static md:block md:border-none bg-white dark:bg-gray-900 md:bg-transparent`}
                >
                    <ul className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-0 text-gray-900 dark:text-white">
                        <li className="py-2 md:py-0">
                            <Link
                                href="/schedule"
                                className="block w-full hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => setMenuOpen(false)}
                            >
                                Schedule
                            </Link>
                        </li>

                        {role === "admin" && (
                            <li className="py-2 md:py-0">
                                <Link
                                    href="/admin"
                                    className="block w-full hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Admin
                                </Link>
                            </li>
                        )}

                        {/* Dropdown Menu - with hover functionality for desktop */}
                        {role !== "admin" && (
                            <li className="relative py-2 md:py-0 group">
                                <button
                                    onClick={() =>
                                        setDropdownOpen(!dropdownOpen)
                                    }
                                    className="flex items-center gap-1 w-full hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    My Team <ChevronDown className="w-4 h-4" />
                                </button>

                                {/* Mobile dropdown (controlled by state) */}
                                {dropdownOpen && (
                                    <div className="md:hidden pl-4 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-700">
                                        <Link
                                            href="/roster"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:rounded"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Roster
                                        </Link>

                                        <Link
                                            href="/editLineup"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:rounded"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Lineup
                                        </Link>

                                        <Link
                                            href="/trade"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 md:rounded"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Trades
                                        </Link>
                                    </div>
                                )}

                                {/* Desktop dropdown (controlled by hover) */}
                                <div className="hidden md:block absolute z-20 mt-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 w-44 invisible group-hover:visible transition-all duration-300 opacity-0 group-hover:opacity-100">
                                    <Link
                                        href="/roster"
                                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        Roster
                                    </Link>

                                    <Link
                                        href="/editLineup"
                                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        Lineup
                                    </Link>

                                    <Link
                                        href="/trade"
                                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        Trades
                                    </Link>
                                </div>
                            </li>
                        )}

                        <li className="py-2 md:py-0">
                            {!isLoggedIn && (
                                <Link
                                    href="/login"
                                    className="block w-full hover:text-blue-600 dark:hover:text-blue-400"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                            {isLoggedIn && (
                                <Button
                                    className="w-full md:w-auto hover:bg-slate-900"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        logout();
                                    }}
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
