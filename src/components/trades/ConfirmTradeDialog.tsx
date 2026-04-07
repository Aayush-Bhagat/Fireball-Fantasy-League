import React from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BasicPlayerDto } from "@/dtos/playerDtos";
import { BasicDraftPickDto } from "@/dtos/teamDtos";
import { TeamTradeAsset } from "@/dtos/tradeDtos";
import { Loader2 } from "lucide-react";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	submitTrade: () => void;
	selectedTeam: TeamTradeAsset;
	selectedTeamPlayers: BasicPlayerDto[];
	selectedTeamPicks: BasicDraftPickDto[];
	selectedOtherTeamPlayers: BasicPlayerDto[];
	selectedOtherTeamPicks: BasicDraftPickDto[];
	isLoading?: boolean;
};

export default function ConfirmTradeDialog({
	open,
	setOpen,
	submitTrade,
	selectedTeam,
	selectedTeamPlayers,
	selectedTeamPicks,
	selectedOtherTeamPlayers,
	selectedOtherTeamPicks,
	isLoading = false,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
									{selectedOtherTeamPlayers.map((p) => (
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
									))}
									{selectedOtherTeamPicks.map((p) => (
										<li
											key={p.id}
											className="flex items-center gap-3 bg-orange-100 p-2 rounded-md"
										>
											<div className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-300 text-white font-bold">
												{p.round}
											</div>
											<span className="text-gray-800">
												Pick {p.round} (Season{" "}
												{p.seasonId})
											</span>
										</li>
									))}
									{selectedOtherTeamPlayers.length === 0 &&
										selectedOtherTeamPicks.length === 0 && (
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
									{selectedTeamPicks.map((p) => (
										<li
											key={p.id}
											className="flex items-center gap-3 bg-green-100 p-2 rounded-md"
										>
											<div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-300 text-white font-bold">
												{p.round}
											</div>
											<span className="text-gray-800">
												Pick {p.round} (Season{" "}
												{p.seasonId})
											</span>
										</li>
									))}
									{selectedTeamPlayers.length === 0 &&
										selectedTeamPicks.length === 0 && (
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
					<Button
						className="bg-purple-700 text-white hover:bg-purple-800"
						onClick={() => {
							submitTrade();
						}}
					>
						{isLoading ? (
							<>
								<Loader2 className="animate-spin text-white" />
								Sending...
							</>
						) : (
							"Send Trade"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
