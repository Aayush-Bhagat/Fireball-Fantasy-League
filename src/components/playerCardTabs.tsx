"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { PlayerWithStatsDto } from "@/dtos/playerDtos";
import PlayerCard from "./playerCard";

type Props = {
    initialPlayer: PlayerWithStatsDto;
    players: PlayerWithStatsDto[];
    onClose: () => void;
};

function getPlayerImage(player: PlayerWithStatsDto): string | null {
    return player.playerCardImage || player.image || null;
}

function getTeamName(player: PlayerWithStatsDto): string {
    return player.team?.name ?? "";
}

export default function PlayerCardTabs({
    initialPlayer,
    players,
    onClose,
}: Props) {
    const [openPlayers, setOpenPlayers] = useState<PlayerWithStatsDto[]>([
        initialPlayer,
    ]);

    const [activePlayerId, setActivePlayerId] = useState<string>(
        initialPlayer.id,
    );

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const activePlayer =
        openPlayers.find((player) => player.id === activePlayerId) ??
        openPlayers[0];

    const availablePlayers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return players
            .filter(
                (player) =>
                    !openPlayers.some(
                        (openPlayer) => openPlayer.id === player.id,
                    ),
            )
            .filter((player) => {
                if (!query) return true;

                return (
                    player.name.toLowerCase().includes(query) ||
                    getTeamName(player).toLowerCase().includes(query)
                );
            })
            .slice(0, 15);
    }, [players, openPlayers, searchQuery]);

    const addPlayer = (player: PlayerWithStatsDto) => {
        setOpenPlayers((current) => {
            if (current.some((openPlayer) => openPlayer.id === player.id)) {
                return current;
            }

            return [...current, player];
        });

        setActivePlayerId(player.id);
        setSearchQuery("");
        setSearchOpen(false);
    };

    const removePlayer = (playerId: string) => {
        if (openPlayers.length === 1) {
            onClose();
            return;
        }

        const index = openPlayers.findIndex((player) => player.id === playerId);

        const remainingPlayers = openPlayers.filter(
            (player) => player.id !== playerId,
        );

        setOpenPlayers(remainingPlayers);

        if (playerId === activePlayerId) {
            const nextIndex = Math.min(index, remainingPlayers.length - 1);

            setActivePlayerId(remainingPlayers[nextIndex].id);
        }
    };

    if (!activePlayer) {
        return null;
    }

    return (
        <div className="w-full overflow-hidden rounded-t-2xl">
            {/* TOP TABS */}
            <div
                className="
        relative
        z-[70]
        w-full
        border
        border-b-0
        border-slate-200
        bg-white
    "
            >
                <div className="flex h-14 w-full items-stretch">
                    {/* =================================================
                        OPEN PLAYER TABS
                    ================================================= */}

                    <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="flex h-14 min-w-max items-stretch">
                            {openPlayers.map((player) => {
                                const isActive = player.id === activePlayerId;

                                const image = getPlayerImage(player);

                                return (
                                    <div
                                        key={player.id}
                                        className={`
                                            group
                                            flex
                                            h-14
                                            min-w-[150px]
                                            max-w-[210px]
                                            items-center
                                            gap-2
                                            border-r
                                            border-slate-200
                                            px-3
                                            ${
                                                isActive
                                                    ? "bg-white"
                                                    : "bg-slate-50 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActivePlayerId(player.id)
                                            }
                                            className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
                                        >
                                            {/* Player image */}
                                            <div
                                                className={`
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-full
                                                    border
                                                    ${
                                                        isActive
                                                            ? "border-slate-200 bg-slate-50"
                                                            : "border-slate-200 bg-white"
                                                    }
                                                `}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {player.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Player information */}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`
                                                        truncate
                                                        text-xs
                                                        font-bold
                                                        ${
                                                            isActive
                                                                ? "text-slate-900"
                                                                : "text-slate-600"
                                                        }
                                                    `}
                                                >
                                                    {player.name}
                                                </p>

                                                <p className="truncate text-[10px] text-slate-400">
                                                    {getTeamName(player) ||
                                                        "Free Agent"}
                                                </p>
                                            </div>
                                        </button>

                                        {/* Individual tab close */}
                                        <button
                                            type="button"
                                            aria-label={`Close ${player.name}`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removePlayer(player.id);
                                            }}
                                            className="
                                                flex
                                                h-6
                                                w-6
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-md
                                                text-slate-400
                                                transition
                                                hover:bg-slate-200
                                                hover:text-slate-900
                                            "
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT CONTROLS
                    ================================================= */}

                    <div className="relative flex h-14 shrink-0 items-center border-l border-slate-200 bg-white">
                        {/* Add player */}
                        <button
                            type="button"
                            aria-label="Add player"
                            onClick={() => {
                                setSearchOpen((open) => !open);
                                setSearchQuery("");
                            }}
                            className="
                                flex
                                h-14
                                w-11
                                items-center
                                justify-center
                                text-slate-500
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                            "
                        >
                            <Plus className="h-5 w-5" />
                        </button>

                        {/* Close entire card */}
                        <button
                            type="button"
                            aria-label="Close player card"
                            onClick={onClose}
                            className="
                                flex
                                h-14
                                w-11
                                items-center
                                justify-center
                                border-l
                                border-slate-200
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                            "
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* =================================================
                            SEARCH DROPDOWN
                        ================================================= */}

                        {searchOpen && (
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-[calc(100%+8px)]
                                    z-[200]
                                    w-[320px]
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    shadow-2xl
                                "
                                onClick={(event) => event.stopPropagation()}
                            >
                                {/* Search input */}
                                <div className="border-b border-slate-100 bg-white p-3">
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-lg
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            px-3
                                            focus-within:border-slate-400
                                            focus-within:ring-2
                                            focus-within:ring-slate-200
                                        "
                                    >
                                        <Search className="h-4 w-4 shrink-0 text-slate-400" />

                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(event) =>
                                                setSearchQuery(
                                                    event.target.value,
                                                )
                                            }
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            onKeyDown={(event) =>
                                                event.stopPropagation()
                                            }
                                            autoFocus
                                            placeholder="Search players..."
                                            className="
                                                h-10
                                                min-w-0
                                                flex-1
                                                bg-transparent
                                                text-sm
                                                text-slate-900
                                                outline-none
                                                placeholder:text-slate-400
                                            "
                                        />

                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchQuery("")
                                                }
                                                className="
                                                    flex
                                                    h-6
                                                    w-6
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    text-slate-400
                                                    hover:bg-slate-200
                                                    hover:text-slate-700
                                                "
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="max-h-[320px] overflow-y-auto p-1">
                                    {availablePlayers.length === 0 ? (
                                        <div className="px-3 py-8 text-center">
                                            <p className="text-sm font-semibold text-slate-700">
                                                No players found
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Try another name or team
                                            </p>
                                        </div>
                                    ) : (
                                        availablePlayers.map((player) => {
                                            const image =
                                                getPlayerImage(player);

                                            return (
                                                <button
                                                    key={player.id}
                                                    type="button"
                                                    onClick={() =>
                                                        addPlayer(player)
                                                    }
                                                    className="
                                                        flex
                                                        w-full
                                                        items-center
                                                        gap-3
                                                        rounded-lg
                                                        px-3
                                                        py-2.5
                                                        text-left
                                                        transition
                                                        hover:bg-slate-100
                                                    "
                                                >
                                                    {/* Image */}
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt=""
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">
                                                                {player.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {player.name}
                                                        </p>

                                                        <p className="truncate text-xs text-slate-500">
                                                            {getTeamName(
                                                                player,
                                                            ) || "Free Agent"}
                                                        </p>
                                                    </div>

                                                    <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================================
                PLAYER CARD
            ========================================================= */}

            <div className="w-full overflow-hidden rounded-b-2xl">
                <PlayerCard
                    key={activePlayer.id}
                    player={activePlayer}
                    onClose={undefined}
                />
            </div>
        </div>
    );
}
