import React, { useRef } from "react";
import { BasicPlayerDto } from "@/dtos/playerDtos";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function PlayerSelect({
    label,
    players,
    selected,
    onSelect,
    disabledId,
}: {
    label: string;
    players: BasicPlayerDto[];
    selected: BasicPlayerDto | null;
    onSelect: (p: BasicPlayerDto) => void;
    disabledId?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <div>
            <h3 className="font-semibold mb-2">{label}</h3>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={triggerRef}
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                    >
                        {selected ? selected.name : `Select ${label}`}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    style={{ width: triggerRef.current?.offsetWidth }}
                    className="p-0"
                >
                    <Command>
                        <CommandInput placeholder="Search players..." />
                        <CommandList>
                            <CommandEmpty>No players found.</CommandEmpty>

                            <CommandGroup>
                                {players.map((player) => (
                                    <CommandItem
                                        key={player.id}
                                        value={player.name}
                                        disabled={player.id === disabledId}
                                        onSelect={() => {
                                            onSelect(player);
                                            setOpen(false);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        {player.image && (
                                            <img
                                                src={player.image}
                                                alt={player.name}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        )}

                                        <span className="flex-1">
                                            {player.name}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
