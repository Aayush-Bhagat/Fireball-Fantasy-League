"use client";

import { useState } from "react";
import {
    ChevronDown,
    Menu,
    X,
    Home,
    CalendarDays,
    Users,
    Shield,
    UserRound,
    LineChart,
    ArrowLeftRight,
    ChartColumn,
    GitCompare,
} from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/app/login/actions";
import Link from "next/link";
import PlayerSearch from "./PlayerSearch";

type Props = {
    isLoggedIn: boolean;
    role: string;
};

export default function NavBar({ isLoggedIn, role }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    const toggleMenu = () => {
        if (menuOpen) {
            closeMenu();
        } else {
            setMenuOpen(true);
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex h-[68px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* ================================================== */}
                {/* Logo */}
                {/* ================================================== */}

                <Link
                    href="/"
                    onClick={closeMenu}
                    className="group flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:bg-violet-100">
                        <img
                            src="/images/Fireball_League_Logo.png"
                            alt="Fireball League Logo"
                            className="h-8 w-8 object-contain"
                        />
                    </div>

                    <div className="hidden sm:block">
                        <div className="text-[20px] font-bold tracking-tight text-gray-900">
                            Fireball League
                        </div>
                    </div>
                </Link>

                {/* ================================================== */}
                {/* Desktop Navigation */}
                {/* ================================================== */}

                <div className="hidden md:flex md:items-center md:gap-1">
                    {/* Home */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Home className="h-4 w-4 text-gray-400 transition-colors group-hover:text-violet-600" />
                        <span>Home</span>
                    </Link>

                    {/* Free Agents */}
                    <Link
                        href="/freeAgents"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Users className="h-4 w-4 text-gray-400 transition-colors group-hover:text-violet-600" />
                        <span>Free Agents</span>
                    </Link>

                    {/* Standings */}
                    <Link
                        href="/standings"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                        <ChartColumn className="h-4 w-4 text-gray-400 transition-colors group-hover:text-violet-600" />
                        <span>Standings</span>
                    </Link>

                    {/* Schedule */}
                    <Link
                        href="/schedule"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                    >
                        <CalendarDays className="h-4 w-4 text-gray-400 transition-colors group-hover:text-violet-600" />
                        <span>Schedule</span>
                    </Link>

                    {/* Admin */}
                    {role === "admin" && (
                        <Link
                            href="/admin"
                            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                        >
                            <Shield className="h-4 w-4 text-gray-400 transition-colors group-hover:text-violet-600" />
                            <span>Admin</span>
                        </Link>
                    )}

                    {/* ================================================== */}
                    {/* My Team Dropdown */}
                    {/* ================================================== */}

                    {role !== "admin" && (
                        <div
                            className="group relative"
                            onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    dropdownOpen
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                <UserRound
                                    className={`h-4 w-4 transition-colors ${
                                        dropdownOpen
                                            ? "text-violet-600"
                                            : "text-gray-400"
                                    }`}
                                />

                                <span>My Team</span>

                                <ChevronDown
                                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                                        dropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Dropdown */}
                            <div
                                className={`absolute right-0 top-full w-52 pt-2 transition-all duration-200 ${
                                    dropdownOpen
                                        ? "visible translate-y-0 opacity-100"
                                        : "invisible -translate-y-1 opacity-0"
                                }`}
                            >
                                <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                                    {/* Dropdown Header */}
                                    <div className="mb-1 px-3 py-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            Team Management
                                        </p>
                                    </div>

                                    {/* Roster */}
                                    <Link
                                        href="/roster"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                                        onClick={closeMenu}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <Users className="h-4 w-4 text-gray-500" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Roster
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Manage your players
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Lineup */}
                                    <Link
                                        href="/editLineup"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                                        onClick={closeMenu}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <LineChart className="h-4 w-4 text-gray-500" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Lineup
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Set your starting lineup
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Trades */}
                                    <Link
                                        href="/viewTrades"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                                        onClick={closeMenu}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <ArrowLeftRight className="h-4 w-4 text-gray-500" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Trades
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Manage trade offers
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Compare */}
                                    <Link
                                        href="/compare"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                                        onClick={closeMenu}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <GitCompare className="h-4 w-4 text-gray-500" />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Compare
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Compare players
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ================================================== */}
                {/* Right Side */}
                {/* ================================================== */}

                <div className="hidden items-center gap-3 md:flex">
                    {/* Player Search */}
                    <PlayerSearch />

                    <div className="h-6 w-px bg-gray-200" />

                    {/* Authentication */}
                    {!isLoggedIn ? (
                        <Link href="/login">
                            <Button
                                variant="outline"
                                className="h-9 rounded-lg border-gray-200 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                                Log In
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => logout()}
                            className="h-9 rounded-lg bg-violet-700 px-4 text-sm font-semibold shadow-sm hover:bg-violet-800"
                        >
                            Log Out
                        </Button>
                    )}
                </div>

                {/* ================================================== */}
                {/* Mobile Button */}
                {/* ================================================== */}

                <button
                    onClick={toggleMenu}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
                    aria-label="Toggle Menu"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* ====================================================== */}
            {/* Mobile Navigation */}
            {/* ====================================================== */}

            {menuOpen && (
                <div className="border-t border-gray-200 bg-white md:hidden">
                    <div className="mx-auto max-w-[1600px] space-y-1 px-4 py-4 sm:px-6">
                        {/* ================================================== */}
                        {/* Mobile Player Search */}
                        {/* ================================================== */}

                        <div className="pb-3">
                            <PlayerSearch mobile />
                        </div>

                        {/* Divider */}
                        <div className="mb-2 border-t border-gray-100" />

                        {/* Mobile Home */}
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <Home className="h-4 w-4 text-gray-400" />
                            Home
                        </Link>

                        {/* Mobile Free Agents */}
                        <Link
                            href="/freeAgents"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <Users className="h-4 w-4 text-gray-400" />
                            Free Agents
                        </Link>

                        {/* Mobile View Players */}
                        <Link
                            href="/players"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <UserRound className="h-4 w-4 text-gray-400" />
                            View Players
                        </Link>

                        {/* Mobile Standings */}
                        <Link
                            href="/standings"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <ChartColumn className="h-4 w-4 text-gray-400" />
                            Standings
                        </Link>

                        {/* Mobile Schedule */}
                        <Link
                            href="/schedule"
                            onClick={closeMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            Schedule
                        </Link>

                        {/* Mobile Admin */}
                        {role === "admin" && (
                            <Link
                                href="/admin"
                                onClick={closeMenu}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <Shield className="h-4 w-4 text-gray-400" />
                                Admin
                            </Link>
                        )}

                        {/* Mobile My Team */}
                        {role !== "admin" && (
                            <div>
                                <button
                                    onClick={() =>
                                        setDropdownOpen(!dropdownOpen)
                                    }
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <span className="flex items-center gap-3">
                                        <UserRound className="h-4 w-4 text-gray-400" />
                                        My Team
                                    </span>

                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform ${
                                            dropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                                        {/* Roster */}
                                        <Link
                                            href="/roster"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            <Users className="h-4 w-4" />
                                            Roster
                                        </Link>

                                        {/* Lineup */}
                                        <Link
                                            href="/editLineup"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            <LineChart className="h-4 w-4" />
                                            Lineup
                                        </Link>

                                        {/* Trades */}
                                        <Link
                                            href="/viewTrades"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            <ArrowLeftRight className="h-4 w-4" />
                                            Trades
                                        </Link>

                                        {/* Compare */}
                                        <Link
                                            href="/compare"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                                        >
                                            <GitCompare className="h-4 w-4" />
                                            Compare
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="my-3 border-t border-gray-100" />

                        {/* Mobile Auth */}
                        {!isLoggedIn ? (
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="block"
                            >
                                <Button className="w-full rounded-lg bg-violet-700 font-semibold hover:bg-violet-800">
                                    Log In
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                className="w-full rounded-lg bg-violet-700 font-semibold hover:bg-violet-800"
                                onClick={() => {
                                    closeMenu();
                                    logout();
                                }}
                            >
                                Log Out
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
