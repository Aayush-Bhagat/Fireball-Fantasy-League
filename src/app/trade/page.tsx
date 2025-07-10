"use client";
import React, { useEffect, useState } from "react";
import { getTradeAssets, sendTradeRequest } from "@/requests/trade";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TeamTradeAsset, TeamTradeAssetsDto } from "@/dtos/tradeDtos";
import { BasicPlayerDto } from "@/dtos/playerDtos";
import { KeepDto } from "@/dtos/teamDtos";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { set } from "date-fns";
export default function TradeScreen() {
    const [selectedTeam, setSelectedTeam] = useState<TeamTradeAsset | null>(
        null
    );
    const [selectedTeamId, setSelectedTeamId] = useState<string>("");

    const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<
        BasicPlayerDto[]
    >([]);
    const [selectedTeamKeeps, setSelectedTeamKeeps] = useState<KeepDto[]>([]);

    const [selectedOtherTeamPlayers, setSelectedOtherTeamPlayers] = useState<
        BasicPlayerDto[]
    >([]);
    const [selectedOtherTeamKeeps, setSelectedOtherTeamKeeps] = useState<
        KeepDto[]
    >([]);
    const [open, setOpen] = React.useState(false);

    const { data: tradeAssets } = useQuery({
        queryKey: ["tradeAssets"],
        queryFn: async () => {
            const supabase = createClient();
            const { data: user } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in to save a lineup");
                return;
            }

            const token = (await supabase.auth.getSession()).data.session
                ?.access_token;
            if (!token) {
                toast.error("You must be logged in to save a lineup");
                return;
            }
            const assets = await getTradeAssets(token);

            setSelectedTeam(assets.availableAssets[0] || null);
            setSelectedTeamId(assets.availableAssets[0]?.id || "");

            return assets;
        },
    });

    const handleSubmitTrade = async () => {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();
        if (!user) {
            toast.error("You must be logged in to save a lineup");
            return;
        }

        const token = (await supabase.auth.getSession()).data.session
            ?.access_token;
        if (!token) {
            toast.error("You must be logged in to save a lineup");
            return;
        }
        await sendTradeRequest(token, {
            receivingTeamId: selectedTeamId,
            proposingTeamPlayers: selectedTeamPlayers.map((p) => p.id),
            proposingTeamKeeps: selectedTeamKeeps.map((k) => k.id),
            receivingTeamPlayers: selectedOtherTeamPlayers.map((p) => p.id),
            receivingTeamKeeps: selectedOtherTeamKeeps.map((k) => k.id),
        });
        clearTrade();
        setOpen(false);
        toast.success("Trade request sent successfully!");
    };

    const clearTrade = () => {
        setSelectedTeamPlayers([]);
        setSelectedTeamKeeps([]);
        setSelectedOtherTeamPlayers([]);
        setSelectedOtherTeamKeeps([]);
    };

    useEffect(() => {
        setSelectedOtherTeamPlayers([]);
        setSelectedOtherTeamKeeps([]);
    }, [selectedTeam]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 bg-white rounded-xl shadow-md space-y-6 mt-10">
            <h2 className="text-4xl font-bold text-center text-purple-700">
                Propose Trade
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Your Team */}
                <div className="w-full md:w-1/2 border p-4 rounded-lg bg-green-50 ">
                    <h3 className="text-2xl font-semibold text-green-700 mb-4">
                        Your Team
                    </h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        <ul className="space-y-3 ">
                            {tradeAssets?.teamAssets.players.map((player) => (
                                <li
                                    className="flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-100 cursor-pointer"
                                    key={player.id}
                                    onClick={() => {
                                        if (
                                            selectedTeamPlayers.includes(player)
                                        ) {
                                            setSelectedTeamPlayers(
                                                selectedTeamPlayers.filter(
                                                    (p) => p.id !== player.id
                                                )
                                            );
                                        } else {
                                            setSelectedTeamPlayers([
                                                ...selectedTeamPlayers,
                                                player,
                                            ]);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {player.image && (
                                            <img
                                                className="h-12 w-12 object-contain transform -scale-x-100  rounded-full border border-green-400"
                                                src={player.image}
                                                alt={player.name}
                                            />
                                        )}
                                        <span className="text-lg">
                                            {player.name}
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={selectedTeamPlayers.includes(
                                            player
                                        )}
                                        className="border border-black"
                                    />
                                </li>
                            ))}
                            {tradeAssets?.teamAssets.keeps.map((keep) => (
                                <li
                                    className="flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-100 cursor-pointer"
                                    key={keep.id}
                                    onClick={() => {
                                        if (selectedTeamKeeps.includes(keep)) {
                                            setSelectedTeamKeeps(
                                                selectedTeamKeeps.filter(
                                                    (k) => k.id !== keep.id
                                                )
                                            );
                                        } else {
                                            setSelectedTeamKeeps([
                                                ...selectedTeamKeeps,
                                                keep,
                                            ]);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-blue-100 h-12 w-12 text-center flex items-center justify-center font-bold text-l">
                                            {keep.odds}
                                        </div>

                                        <span className="text-lg">
                                            Keep {keep.odds} (Season:{" "}
                                            {keep.seasonId})
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={selectedTeamKeeps.includes(
                                            keep
                                        )}
                                        className="border border-black"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Other Team */}
                <div className="w-full md:w-1/2 border p-4 rounded-lg bg-orange-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-orange-700">
                            Trade With
                        </h3>

                        <Select
                            onValueChange={(val: string) => {
                                const selected =
                                    tradeAssets?.availableAssets.find(
                                        (t) => t.id === val
                                    );
                                setSelectedTeam(selected || null);
                                setSelectedTeamId(val);
                            }}
                            value={selectedTeamId}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a Team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Teams</SelectLabel>
                                    {tradeAssets?.availableAssets.map(
                                        (team) => (
                                            <SelectItem
                                                key={team.id}
                                                value={team.id}
                                                onClick={() => {
                                                    setSelectedTeam(team);
                                                    setSelectedTeamId(team.id);
                                                }}
                                            >
                                                <div>
                                                    {team.logo && (
                                                        <img
                                                            className="h-6 w-6 rounded-full object-contain mr-2"
                                                            src={team.logo}
                                                            alt={team.name}
                                                        />
                                                    )}
                                                </div>
                                                {team.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        <ul className="space-y-3  o">
                            {selectedTeam?.players.map((player) => (
                                <li
                                    className="flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-100 cursor-pointer"
                                    key={player.id}
                                    onClick={() => {
                                        if (
                                            selectedOtherTeamPlayers.includes(
                                                player
                                            )
                                        ) {
                                            setSelectedOtherTeamPlayers(
                                                selectedOtherTeamPlayers.filter(
                                                    (p) => p.id !== player.id
                                                )
                                            );
                                        } else {
                                            setSelectedOtherTeamPlayers([
                                                ...selectedOtherTeamPlayers,
                                                player,
                                            ]);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {player.image && (
                                            <img
                                                className="h-12 w-12 object-contain transform  rounded-full border border-orange-400 "
                                                src={player.image}
                                                alt={player.name}
                                            />
                                        )}
                                        <span className="text-lg">
                                            {player.name}
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={selectedOtherTeamPlayers.includes(
                                            player
                                        )}
                                        className="border border-black"
                                    />
                                </li>
                            ))}
                            {selectedTeam?.keeps.map((keep) => (
                                <li
                                    className="flex items-center justify-between p-3 rounded shadow transition-transform transform hover:scale-100 cursor-pointer"
                                    key={keep.id}
                                    onClick={() => {
                                        if (
                                            selectedOtherTeamKeeps.includes(
                                                keep
                                            )
                                        ) {
                                            setSelectedOtherTeamKeeps(
                                                selectedOtherTeamKeeps.filter(
                                                    (k) => k.id !== keep.id
                                                )
                                            );
                                        } else {
                                            setSelectedOtherTeamKeeps([
                                                ...selectedOtherTeamKeeps,
                                                keep,
                                            ]);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-pink-200 h-12 w-12 text-center flex items-center justify-center font-bold text-l">
                                            {keep.odds}
                                        </div>

                                        <span className="text-lg">
                                            Keep {keep.odds} (Season:{" "}
                                            {keep.seasonId})
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={selectedOtherTeamKeeps.includes(
                                            keep
                                        )}
                                        className="border border-black"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
                <Button
                    className="px-5 py-2 rounded border text-gray-700 hover:bg-gray-100 bg-white"
                    onClick={clearTrade}
                >
                    Clear
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="px-5 py-2 bg-purple-700 text-white rounded hover:bg-purple-800">
                            Confirm Trade
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-full md:min-w-[700px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">
                                Confirm Trade
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                            You will receive:
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedOtherTeamPlayers.map(
                                                (p) => (
                                                    <li
                                                        key={p.id}
                                                        className="flex items-center gap-3 bg-orange-100 p-2 rounded-md"
                                                    >
                                                        {p.image && (
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className="h-10 w-10 object-contain rounded-full border border-orange-400 -scale-x-100"
                                                            />
                                                        )}
                                                        <span className="text-gray-800">
                                                            {p.name}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                            {selectedOtherTeamKeeps.map((k) => (
                                                <li
                                                    key={k.id}
                                                    className="flex items-center gap-3 bg-orange-100 p-2 rounded-md"
                                                >
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-300 text-white font-bold">
                                                        {k.odds}
                                                    </div>
                                                    <span className="text-gray-800">
                                                        Keep {k.odds} (Season{" "}
                                                        {k.seasonId})
                                                    </span>
                                                </li>
                                            ))}
                                            {selectedOtherTeamPlayers.length ===
                                                0 &&
                                                selectedOtherTeamKeeps.length ===
                                                    0 && (
                                                    <li className="italic text-gray-500">
                                                        Nothing
                                                    </li>
                                                )}
                                        </ul>
                                    </div>
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                            {selectedTeam?.name} will Receive:
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedTeamPlayers.map((p) => (
                                                <li
                                                    key={p.id}
                                                    className="flex items-center gap-3 bg-green-100 p-2 rounded-md"
                                                >
                                                    {p.image && (
                                                        <img
                                                            src={p.image}
                                                            alt={p.name}
                                                            className="h-10 w-10 object-contain rounded-full border border-green-400"
                                                        />
                                                    )}
                                                    <span className="text-gray-800">
                                                        {p.name}
                                                    </span>
                                                </li>
                                            ))}
                                            {selectedTeamKeeps.map((k) => (
                                                <li
                                                    key={k.id}
                                                    className="flex items-center gap-3 bg-green-100 p-2 rounded-md"
                                                >
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-300 text-white font-bold">
                                                        {k.odds}
                                                    </div>
                                                    <span className="text-gray-800">
                                                        Keep {k.odds} (Season{" "}
                                                        {k.seasonId})
                                                    </span>
                                                </li>
                                            ))}
                                            {selectedTeamPlayers.length === 0 &&
                                                selectedTeamKeeps.length ===
                                                    0 && (
                                                    <li className="italic text-gray-500">
                                                        Nothing
                                                    </li>
                                                )}
                                        </ul>
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4"></div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSubmitTrade}>
                                Send Trade
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
