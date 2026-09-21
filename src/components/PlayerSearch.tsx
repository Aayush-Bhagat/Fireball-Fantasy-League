"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, UserRound, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { viewAllPlayers } from "@/requests/players";

type PlayerSearchProps = {
    mobile?: boolean;
};

type SearchPlayer = {
    id: string | number;
    name: string;
    position?: string | null;
    playerCardImage?: string | null;
    team?: {
        name?: string | null;
        abbreviation?: string | null;
    } | null;
};

export default function PlayerSearch({ mobile = false }: PlayerSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["all-players"],
        queryFn: viewAllPlayers,
        staleTime: 5 * 60 * 1000,
    });

    const players: SearchPlayer[] = useMemo(() => {
        return (data?.players ?? []) as SearchPlayer[];
    }, [data]);

    const filteredPlayers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return [];
        }

        return players
            .filter((player) => {
                const name = player.name?.toLowerCase() ?? "";
                const position = player.position?.toLowerCase() ?? "";
                const teamName = player.team?.name?.toLowerCase() ?? "";
                const teamAbbreviation =
                    player.team?.abbreviation?.toLowerCase() ?? "";

                return (
                    name.includes(query) ||
                    position.includes(query) ||
                    teamName.includes(query) ||
                    teamAbbreviation.includes(query)
                );
            })
            .slice(0, 8);
    }, [players, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setSearch("");
                inputRef.current?.blur();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    const handlePlayerClick = () => {
        setIsOpen(false);
        setSearch("");
    };

    const clearSearch = () => {
        setSearch("");
        inputRef.current?.focus();
    };

    /*
     * Mobile version
     *
     * The search is always visible inside the mobile menu.
     */
    if (mobile) {
        return (
            <div ref={searchRef} className="relative w-full">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (search.trim()) {
                                setIsOpen(true);
                            }
                        }}
                        placeholder="Search players..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Clear player search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {isOpen && search.trim() && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                Searching players...
                            </div>
                        ) : filteredPlayers.length > 0 ? (
                            <div className="max-h-[360px] overflow-y-auto p-2">
                                {filteredPlayers.map((player) => (
                                    <Link
                                        key={player.id}
                                        href={`/players/${player.id}/stats`}
                                        onClick={handlePlayerClick}
                                        className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-violet-50"
                                    >
                                        <PlayerImage player={player} />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-violet-700">
                                                {player.name}
                                            </p>

                                            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                                {player.position && (
                                                    <span>
                                                        {player.position}
                                                    </span>
                                                )}

                                                {player.position &&
                                                    player.team?.name && (
                                                        <span className="text-gray-300">
                                                            •
                                                        </span>
                                                    )}

                                                {player.team?.name && (
                                                    <span className="truncate">
                                                        {player.team.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-7 text-center">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>

                                <p className="text-sm font-medium text-gray-700">
                                    No players found
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Try searching for another player
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /*
     * Desktop version
     *
     * Starts as a search icon and expands when clicked.
     */
    return (
        <div ref={searchRef} className="relative flex items-center">
            <div
                className={`flex items-center overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
                    isOpen
                        ? "w-[280px] border-violet-300 shadow-sm ring-2 ring-violet-100"
                        : "w-10 border-transparent"
                }`}
            >
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(true);
                    }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isOpen
                            ? "text-violet-600"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    aria-label="Search players"
                    aria-expanded={isOpen}
                >
                    <Search className="h-[18px] w-[18px]" />
                </button>

                {isOpen && (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                            }}
                            placeholder="Search players..."
                            className="h-10 min-w-0 flex-1 bg-transparent pr-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                            aria-label="Search players"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Clear player search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {isOpen && search.trim() && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[340px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Player Search
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                            Search by name, position, or team
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-7 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                            Searching players...
                        </div>
                    ) : filteredPlayers.length > 0 ? (
                        <div className="max-h-[420px] overflow-y-auto p-2">
                            {filteredPlayers.map((player) => (
                                <Link
                                    key={player.id}
                                    href={`/players/${player.id}/stats`}
                                    onClick={handlePlayerClick}
                                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-violet-50"
                                >
                                    <PlayerImage player={player} />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-violet-700">
                                            {player.name}
                                        </p>

                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                            {player.position && (
                                                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-600">
                                                    {player.position}
                                                </span>
                                            )}

                                            {player.team?.name && (
                                                <span className="truncate">
                                                    {player.team.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-gray-300 transition-colors group-hover:text-violet-400">
                                        →
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>

                            <p className="text-sm font-semibold text-gray-700">
                                No players found
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Try a different player name, position, or team
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function PlayerImage({ player }: { player: SearchPlayer }) {
    return (
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 shadow-md">
            {player.playerCardImage ? (
                <img
                    src={player.playerCardImage}
                    alt={player.name}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
            ) : (
                <UserRound className="h-5 w-5 text-slate-500" />
            )}
        </div>
    );
}
