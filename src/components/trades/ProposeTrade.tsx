"use client";

import { BasicPlayerDto } from "@/dtos/playerDtos";
import { BasicDraftPickDto } from "@/dtos/teamDtos";
import { TeamTradeAsset } from "@/dtos/tradeDtos";
import { createClient } from "@/lib/supabase/client";
import { getTradeAssets, sendTradeRequest } from "@/requests/trade";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import ConfirmTradeDialog from "./ConfirmTradeDialog";
import ProposeTradeSkeleton from "../loaders/ProposeTradeSkeleton";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
    ArrowLeftRight,
    Check,
    CircleDollarSign,
    ClipboardList,
    FileText,
    Handshake,
    Search,
    Send,
    Trash2,
    Users,
    X,
} from "lucide-react";

export default function ProposeTrade() {
    const [selectedTeam, setSelectedTeam] = useState<TeamTradeAsset | null>(
        null,
    );

    const [selectedTeamId, setSelectedTeamId] = useState<string>("");

    const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<
        BasicPlayerDto[]
    >([]);

    const [selectedTeamPicks, setSelectedTeamPicks] = useState<
        BasicDraftPickDto[]
    >([]);

    const [selectedOtherTeamPlayers, setSelectedOtherTeamPlayers] = useState<
        BasicPlayerDto[]
    >([]);

    const [selectedOtherTeamPicks, setSelectedOtherTeamPicks] = useState<
        BasicDraftPickDto[]
    >([]);

    const [open, setOpen] = useState(false);

    const [yourSearch, setYourSearch] = useState("");
    const [theirSearch, setTheirSearch] = useState("");

    const [yourAssetTab, setYourAssetTab] = useState<"players" | "picks">(
        "players",
    );

    const [theirAssetTab, setTheirAssetTab] = useState<"players" | "picks">(
        "players",
    );

    const { data: tradeAssets, isLoading } = useQuery({
        queryKey: ["tradeAssets"],

        queryFn: async () => {
            const supabase = createClient();

            const { data: user } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to propose a trade");
                return;
            }

            const token = (await supabase.auth.getSession()).data.session
                ?.access_token;

            if (!token) {
                toast.error("You must be logged in to propose a trade");
                return;
            }

            const assets = await getTradeAssets(token);

            setSelectedTeam(assets.availableAssets[0] || null);
            setSelectedTeamId(assets.availableAssets[0]?.id || "");

            return assets;
        },
    });

    const handleSubmitTrade = useMutation({
        mutationFn: async () => {
            const supabase = createClient();

            const { data: user } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to propose a trade");
                return;
            }

            const token = (await supabase.auth.getSession()).data.session
                ?.access_token;

            if (!token) {
                toast.error("You must be logged in to propose a trade");
                return;
            }

            await sendTradeRequest(token, {
                receivingTeamId: selectedTeamId,

                proposingTeamPlayers: selectedTeamPlayers.map(
                    (player) => player.id,
                ),

                proposingTeamPicks: selectedTeamPicks.map((pick) => pick.id),

                receivingTeamPlayers: selectedOtherTeamPlayers.map(
                    (player) => player.id,
                ),

                receivingTeamPicks: selectedOtherTeamPicks.map(
                    (pick) => pick.id,
                ),
            });
        },

        onSuccess: () => {
            clearTrade();
            setOpen(false);
            toast.success("Trade request sent successfully!");
        },

        onError: () => {
            toast.error("Failed to send trade request.");
        },
    });

    const clearTrade = () => {
        setSelectedTeamPlayers([]);
        setSelectedTeamPicks([]);
        setSelectedOtherTeamPlayers([]);
        setSelectedOtherTeamPicks([]);

        setYourSearch("");
        setTheirSearch("");
    };

    const clearYourSide = () => {
        setSelectedTeamPlayers([]);
        setSelectedTeamPicks([]);
    };

    const clearTheirSide = () => {
        setSelectedOtherTeamPlayers([]);
        setSelectedOtherTeamPicks([]);
    };

    useEffect(() => {
        setSelectedOtherTeamPlayers([]);
        setSelectedOtherTeamPicks([]);
        setTheirSearch("");
    }, [selectedTeam]);

    const yourPlayers = tradeAssets?.teamAssets.players ?? [];
    const yourPicks = tradeAssets?.teamAssets.draftPicks ?? [];

    const theirPlayers = selectedTeam?.players ?? [];
    const theirPicks = selectedTeam?.draftPicks ?? [];

    /*
     * ------------------------------------------------------------------------
     * FILTERED PLAYERS
     * ------------------------------------------------------------------------
     */

    const filteredYourPlayers = useMemo(() => {
        const query = yourSearch.trim().toLowerCase();

        if (!query) {
            return yourPlayers;
        }

        return yourPlayers.filter((player) =>
            player.name.toLowerCase().includes(query),
        );
    }, [yourPlayers, yourSearch]);

    const filteredTheirPlayers = useMemo(() => {
        const query = theirSearch.trim().toLowerCase();

        if (!query) {
            return theirPlayers;
        }

        return theirPlayers.filter((player) =>
            player.name.toLowerCase().includes(query),
        );
    }, [theirPlayers, theirSearch]);

    /*
     * ------------------------------------------------------------------------
     * FILTERED DRAFT PICKS
     *
     * BasicDraftPickDto does NOT have originalTeam.
     *
     * It only has:
     * originalTeamId
     *
     * Therefore we search against the ID instead of originalTeam.name.
     * ------------------------------------------------------------------------
     */

    const filteredYourPicks = useMemo(() => {
        const query = yourSearch.trim().toLowerCase();

        if (!query) {
            return yourPicks;
        }

        return yourPicks.filter((pick) => {
            const text = `
                round ${pick.round}
                season ${pick.seasonId}
                pick ${pick.pick ?? ""}
                ${pick.originalTeamId}
                ${pick.teamId}
                ${pick.selection ?? ""}
            `.toLowerCase();

            return text.includes(query);
        });
    }, [yourPicks, yourSearch]);

    const filteredTheirPicks = useMemo(() => {
        const query = theirSearch.trim().toLowerCase();

        if (!query) {
            return theirPicks;
        }

        return theirPicks.filter((pick) => {
            const text = `
                round ${pick.round}
                season ${pick.seasonId}
                pick ${pick.pick ?? ""}
                ${pick.originalTeamId}
                ${pick.teamId}
                ${pick.selection ?? ""}
            `.toLowerCase();

            return text.includes(query);
        });
    }, [theirPicks, theirSearch]);

    /*
     * ------------------------------------------------------------------------
     * TRADE COUNTS
     * ------------------------------------------------------------------------
     */

    const totalYouAreSending =
        selectedTeamPlayers.length + selectedTeamPicks.length;

    const totalYouAreReceiving =
        selectedOtherTeamPlayers.length + selectedOtherTeamPicks.length;

    const canSubmitTrade =
        selectedTeamId !== "" &&
        (totalYouAreSending > 0 || totalYouAreReceiving > 0);

    /*
     * ------------------------------------------------------------------------
     * TOGGLE PLAYER
     * ------------------------------------------------------------------------
     */

    const togglePlayer = (player: BasicPlayerDto, side: "your" | "their") => {
        if (side === "your") {
            setSelectedTeamPlayers((current) => {
                const exists = current.some((p) => p.id === player.id);

                if (exists) {
                    return current.filter((p) => p.id !== player.id);
                }

                return [...current, player];
            });
        } else {
            setSelectedOtherTeamPlayers((current) => {
                const exists = current.some((p) => p.id === player.id);

                if (exists) {
                    return current.filter((p) => p.id !== player.id);
                }

                return [...current, player];
            });
        }
    };

    /*
     * ------------------------------------------------------------------------
     * TOGGLE DRAFT PICK
     * ------------------------------------------------------------------------
     */

    const togglePick = (pick: BasicDraftPickDto, side: "your" | "their") => {
        if (side === "your") {
            setSelectedTeamPicks((current) => {
                const exists = current.some((p) => p.id === pick.id);

                if (exists) {
                    return current.filter((p) => p.id !== pick.id);
                }

                return [...current, pick];
            });
        } else {
            setSelectedOtherTeamPicks((current) => {
                const exists = current.some((p) => p.id === pick.id);

                if (exists) {
                    return current.filter((p) => p.id !== pick.id);
                }

                return [...current, pick];
            });
        }
    };

    /*
     * ------------------------------------------------------------------------
     * SELECT ALL PLAYERS
     * ------------------------------------------------------------------------
     */

    const selectAllVisiblePlayers = (
        players: BasicPlayerDto[],
        side: "your" | "their",
    ) => {
        if (side === "your") {
            setSelectedTeamPlayers((current) => {
                const currentIds = new Set(current.map((p) => p.id));

                const allSelected =
                    players.length > 0 &&
                    players.every((p) => currentIds.has(p.id));

                if (allSelected) {
                    return current.filter(
                        (p) => !players.some((visible) => visible.id === p.id),
                    );
                }

                const additions = players.filter((p) => !currentIds.has(p.id));

                return [...current, ...additions];
            });
        } else {
            setSelectedOtherTeamPlayers((current) => {
                const currentIds = new Set(current.map((p) => p.id));

                const allSelected =
                    players.length > 0 &&
                    players.every((p) => currentIds.has(p.id));

                if (allSelected) {
                    return current.filter(
                        (p) => !players.some((visible) => visible.id === p.id),
                    );
                }

                const additions = players.filter((p) => !currentIds.has(p.id));

                return [...current, ...additions];
            });
        }
    };

    /*
     * ------------------------------------------------------------------------
     * SELECT ALL DRAFT PICKS
     * ------------------------------------------------------------------------
     */

    const selectAllVisiblePicks = (
        picks: BasicDraftPickDto[],
        side: "your" | "their",
    ) => {
        if (side === "your") {
            setSelectedTeamPicks((current) => {
                const currentIds = new Set(current.map((p) => p.id));

                const allSelected =
                    picks.length > 0 &&
                    picks.every((p) => currentIds.has(p.id));

                if (allSelected) {
                    return current.filter(
                        (p) => !picks.some((visible) => visible.id === p.id),
                    );
                }

                const additions = picks.filter((p) => !currentIds.has(p.id));

                return [...current, ...additions];
            });
        } else {
            setSelectedOtherTeamPicks((current) => {
                const currentIds = new Set(current.map((p) => p.id));

                const allSelected =
                    picks.length > 0 &&
                    picks.every((p) => currentIds.has(p.id));

                if (allSelected) {
                    return current.filter(
                        (p) => !picks.some((visible) => visible.id === p.id),
                    );
                }

                const additions = picks.filter((p) => !currentIds.has(p.id));

                return [...current, ...additions];
            });
        }
    };

    if (isLoading) {
        return <ProposeTradeSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto max-w-7xl">
                {/* Header */}

                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm">
                            <Handshake className="h-6 w-6" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                Propose a Trade
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 md:text-base">
                                Build a trade by selecting the players and draft
                                picks you want to send and receive.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trade Status */}

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                <ArrowLeftRight className="h-5 w-5 text-slate-600" />
                            </div>

                            <div>
                                <p className="font-semibold text-slate-900">
                                    Trade Builder
                                </p>

                                <p className="text-sm text-slate-500">
                                    Select assets on either side of the trade.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <StatusPill
                                icon={<Send className="h-3.5 w-3.5" />}
                                label="Sending"
                                count={totalYouAreSending}
                            />

                            <StatusPill
                                icon={
                                    <CircleDollarSign className="h-3.5 w-3.5" />
                                }
                                label="Receiving"
                                count={totalYouAreReceiving}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Trade Area */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_auto_1fr]">
                    {/* YOUR TEAM */}

                    <TradePanel
                        title="Your Team"
                        subtitle="Assets you're offering"
                        accent="green"
                        logo={tradeAssets?.teamAssets.logo}
                        teamName={tradeAssets?.teamAssets.name}
                        selectedCount={totalYouAreSending}
                        search={yourSearch}
                        setSearch={setYourSearch}
                        assetTab={yourAssetTab}
                        setAssetTab={setYourAssetTab}
                        clearSide={clearYourSide}
                        playerCount={yourPlayers.length}
                        pickCount={yourPicks.length}
                    >
                        {yourAssetTab === "players" ? (
                            <AssetList
                                type="player"
                                players={filteredYourPlayers}
                                selectedPlayers={selectedTeamPlayers}
                                onToggle={(player) =>
                                    togglePlayer(
                                        player as BasicPlayerDto,
                                        "your",
                                    )
                                }
                                onSelectAll={() =>
                                    selectAllVisiblePlayers(
                                        filteredYourPlayers,
                                        "your",
                                    )
                                }
                            />
                        ) : (
                            <AssetList
                                type="pick"
                                picks={filteredYourPicks}
                                selectedPicks={selectedTeamPicks}
                                onToggle={(pick) =>
                                    togglePick(
                                        pick as BasicDraftPickDto,
                                        "your",
                                    )
                                }
                                onSelectAll={() =>
                                    selectAllVisiblePicks(
                                        filteredYourPicks,
                                        "your",
                                    )
                                }
                            />
                        )}
                    </TradePanel>

                    {/* CENTER */}

                    <div className="hidden items-center justify-center xl:flex">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md">
                            <ArrowLeftRight className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>

                    {/* OTHER TEAM */}

                    <TradePanel
                        title="Trade With"
                        subtitle={
                            selectedTeam
                                ? `Select assets from ${selectedTeam.name}`
                                : "Choose a team to trade with"
                        }
                        accent="orange"
                        logo={selectedTeam?.logo}
                        teamName={selectedTeam?.name}
                        selectedCount={totalYouAreReceiving}
                        search={theirSearch}
                        setSearch={setTheirSearch}
                        assetTab={theirAssetTab}
                        setAssetTab={setTheirAssetTab}
                        clearSide={clearTheirSide}
                        playerCount={theirPlayers.length}
                        pickCount={theirPicks.length}
                        teamSelector={
                            <Select
                                value={selectedTeamId}
                                onValueChange={(value) => {
                                    const team =
                                        tradeAssets?.availableAssets.find(
                                            (t) => t.id === value,
                                        );

                                    setSelectedTeam(team || null);

                                    setSelectedTeamId(value);
                                }}
                            >
                                <SelectTrigger className="w-full border-slate-200 bg-white">
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            Available Teams
                                        </SelectLabel>

                                        {tradeAssets?.availableAssets.map(
                                            (team) => (
                                                <SelectItem
                                                    key={team.id}
                                                    value={team.id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {team.logo ? (
                                                            <img
                                                                src={team.logo}
                                                                alt=""
                                                                className="h-6 w-6 rounded-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full bg-slate-200" />
                                                        )}

                                                        <span>{team.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        }
                    >
                        {!selectedTeam ? (
                            <EmptyState
                                icon={
                                    <Users className="h-7 w-7 text-slate-400" />
                                }
                                title="Choose a team"
                                description="Select a team above to see their available players and draft picks."
                            />
                        ) : theirAssetTab === "players" ? (
                            <AssetList
                                type="player"
                                players={filteredTheirPlayers}
                                selectedPlayers={selectedOtherTeamPlayers}
                                onToggle={(player) =>
                                    togglePlayer(
                                        player as BasicPlayerDto,
                                        "their",
                                    )
                                }
                                onSelectAll={() =>
                                    selectAllVisiblePlayers(
                                        filteredTheirPlayers,
                                        "their",
                                    )
                                }
                            />
                        ) : (
                            <AssetList
                                type="pick"
                                picks={filteredTheirPicks}
                                selectedPicks={selectedOtherTeamPicks}
                                onToggle={(pick) =>
                                    togglePick(
                                        pick as BasicDraftPickDto,
                                        "their",
                                    )
                                }
                                onSelectAll={() =>
                                    selectAllVisiblePicks(
                                        filteredTheirPicks,
                                        "their",
                                    )
                                }
                            />
                        )}
                    </TradePanel>
                </div>

                {/* Trade Summary */}

                <div className="sticky bottom-4 z-20 mt-6">
                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-purple-600" />

                                    <h3 className="font-semibold text-slate-900">
                                        Trade Summary
                                    </h3>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    {totalYouAreSending === 0 &&
                                    totalYouAreReceiving === 0
                                        ? "No assets selected yet."
                                        : `You're sending ${totalYouAreSending} asset${
                                              totalYouAreSending === 1
                                                  ? ""
                                                  : "s"
                                          } and receiving ${totalYouAreReceiving} asset${
                                              totalYouAreReceiving === 1
                                                  ? ""
                                                  : "s"
                                          }.`}
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={clearTrade}
                                    disabled={
                                        totalYouAreSending === 0 &&
                                        totalYouAreReceiving === 0
                                    }
                                    className="h-11 gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear Trade
                                </Button>

                                <Button
                                    disabled={!canSubmitTrade}
                                    onClick={() => setOpen(true)}
                                    className="h-11 gap-2 bg-purple-600 px-6 text-white hover:bg-purple-700"
                                >
                                    <Handshake className="h-4 w-4" />
                                    Review Trade
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Dialog */}

                {open && selectedTeam && (
                    <ConfirmTradeDialog
                        open={open}
                        setOpen={setOpen}
                        submitTrade={handleSubmitTrade.mutate}
                        selectedTeam={selectedTeam}
                        selectedTeamPlayers={selectedTeamPlayers}
                        selectedTeamPicks={selectedTeamPicks}
                        selectedOtherTeamPlayers={selectedOtherTeamPlayers}
                        selectedOtherTeamPicks={selectedOtherTeamPicks}
                        isLoading={handleSubmitTrade.isPending}
                    />
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STATUS PILL
|--------------------------------------------------------------------------
*/

function StatusPill({
    icon,
    label,
    count,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
}) {
    return (
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm">
            {icon}

            <span className="text-slate-500">{label}</span>

            <span className="font-bold text-slate-900">{count}</span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| TRADE PANEL
|--------------------------------------------------------------------------
*/

function TradePanel({
    title,
    subtitle,
    accent,
    logo,
    teamName,
    selectedCount,
    search,
    setSearch,
    assetTab,
    setAssetTab,
    clearSide,
    playerCount,
    pickCount,
    teamSelector,
    children,
}: {
    title: string;
    subtitle: string;
    accent: "green" | "orange";
    logo?: string | null;
    teamName?: string;
    selectedCount: number;
    search: string;
    setSearch: (value: string) => void;
    assetTab: "players" | "picks";
    setAssetTab: (value: "players" | "picks") => void;
    clearSide: () => void;
    playerCount: number;
    pickCount: number;
    teamSelector?: React.ReactNode;
    children: React.ReactNode;
}) {
    const isGreen = accent === "green";

    return (
        <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                isGreen ? "border-green-200" : "border-orange-200"
            }`}
        >
            {/* Panel Header */}

            <div
                className={`border-b p-5 ${
                    isGreen
                        ? "border-green-100 bg-green-50/70"
                        : "border-orange-100 bg-orange-50/70"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm ${
                                isGreen
                                    ? "border-green-200"
                                    : "border-orange-200"
                            }`}
                        >
                            {logo ? (
                                <img
                                    src={logo}
                                    alt={teamName || title}
                                    className="h-9 w-9 object-contain"
                                />
                            ) : (
                                <Users
                                    className={`h-6 w-6 ${
                                        isGreen
                                            ? "text-green-600"
                                            : "text-orange-600"
                                    }`}
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-bold text-slate-900">
                                {teamName || title}
                            </h2>

                            <p className="truncate text-sm text-slate-500">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    <div
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                            isGreen
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                        }`}
                    >
                        {selectedCount} selected
                    </div>
                </div>

                {teamSelector && <div className="mt-4">{teamSelector}</div>}
            </div>

            {/* Search */}

            <div className="border-b border-slate-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={
                            assetTab === "players"
                                ? "Search players..."
                                : "Search draft picks..."
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}

            <div className="flex border-b border-slate-100 px-4">
                <button
                    type="button"
                    onClick={() => setAssetTab("players")}
                    className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition ${
                        assetTab === "players"
                            ? "text-purple-700"
                            : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Players
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs">
                        {playerCount}
                    </span>
                    {assetTab === "players" && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setAssetTab("picks")}
                    className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold transition ${
                        assetTab === "picks"
                            ? "text-purple-700"
                            : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Draft Picks
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs">
                        {pickCount}
                    </span>
                    {assetTab === "picks" && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600" />
                    )}
                </button>

                {selectedCount > 0 && (
                    <button
                        type="button"
                        onClick={clearSide}
                        className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Asset List */}

            <div className="max-h-[600px] min-h-[360px] overflow-y-auto p-4">
                {children}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| ASSET LIST
|--------------------------------------------------------------------------
*/

function AssetList({
    type,
    players,
    picks,
    selectedPlayers,
    selectedPicks,
    onToggle,
    onSelectAll,
}: {
    type: "player" | "pick";
    players?: BasicPlayerDto[];
    picks?: BasicDraftPickDto[];
    selectedPlayers?: BasicPlayerDto[];
    selectedPicks?: BasicDraftPickDto[];
    onToggle: (asset: BasicPlayerDto | BasicDraftPickDto) => void;
    onSelectAll: () => void;
}) {
    const assets = type === "player" ? (players ?? []) : (picks ?? []);

    const selected =
        type === "player" ? (selectedPlayers ?? []) : (selectedPicks ?? []);

    const selectedIds = new Set(selected.map((item) => item.id));

    if (assets.length === 0) {
        return (
            <EmptyState
                icon={
                    type === "player" ? (
                        <Users className="h-7 w-7 text-slate-400" />
                    ) : (
                        <FileText className="h-7 w-7 text-slate-400" />
                    )
                }
                title={
                    type === "player"
                        ? "No players found"
                        : "No draft picks found"
                }
                description="Try changing your search or selecting another asset category."
            />
        );
    }

    const allSelected =
        assets.length > 0 && assets.every((asset) => selectedIds.has(asset.id));

    return (
        <div className="space-y-3">
            {/* Select All */}

            <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {assets.length} available
                </p>

                <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                >
                    {allSelected ? "Deselect visible" : "Select all visible"}
                </button>
            </div>

            <div className="space-y-2">
                {type === "player"
                    ? players?.map((player) => (
                          <PlayerAssetRow
                              key={player.id}
                              player={player}
                              selected={selectedIds.has(player.id)}
                              onToggle={() => onToggle(player)}
                          />
                      ))
                    : picks?.map((pick) => (
                          <DraftPickAssetRow
                              key={pick.id}
                              pick={pick}
                              selected={selectedIds.has(pick.id)}
                              onToggle={() => onToggle(pick)}
                          />
                      ))}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| PLAYER ROW
|--------------------------------------------------------------------------
*/

function PlayerAssetRow({
    player,
    selected,
    onToggle,
}: {
    player: BasicPlayerDto;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                selected
                    ? "border-purple-300 bg-purple-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            }`}
        >
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
                    selected
                        ? "border-purple-300 bg-white"
                        : "border-slate-200 bg-slate-50"
                }`}
            >
                {player.image ? (
                    <img
                        src={player.image}
                        alt={player.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <Users className="h-5 w-5 text-slate-400" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                    {player.name}
                </p>
            </div>

            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                    selected
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-300 bg-white"
                }`}
            >
                {selected && <Check className="h-4 w-4" />}
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| DRAFT PICK ROW
|--------------------------------------------------------------------------
*/

function DraftPickAssetRow({
    pick,
    selected,
    onToggle,
}: {
    pick: BasicDraftPickDto;
    selected: boolean;
    onToggle: () => void;
}) {
    const isTraded = pick.teamId !== pick.originalTeamId;

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                selected
                    ? "border-purple-300 bg-purple-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            }`}
        >
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                    selected
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-700"
                }`}
            >
                R{pick.round}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">
                        Round {pick.round}
                    </p>

                    {pick.pick !== null && (
                        <span className="text-xs text-slate-400">
                            Pick #{pick.pick}
                        </span>
                    )}
                </div>

                <p className="text-xs text-slate-500">Season {pick.seasonId}</p>

                {isTraded && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <ArrowLeftRight className="h-3 w-3" />

                        <span>Previously owned by another team</span>
                    </div>
                )}
            </div>

            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                    selected
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-slate-300 bg-white"
                }`}
            >
                {selected && <Check className="h-4 w-4" />}
            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                {icon}
            </div>

            <h3 className="font-semibold text-slate-800">{title}</h3>

            <p className="mt-1 max-w-xs text-sm leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}
