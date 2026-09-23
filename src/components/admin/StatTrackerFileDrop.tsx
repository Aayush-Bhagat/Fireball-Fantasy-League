"use client";

import { useState, type DragEvent, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { updateGameStats } from "@/requests/games";

type Props = {
	gameId: string;
};

export default function StatTrackerFileDrop({ gameId }: Props) {
	const supabase = createClient();
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFile = (selectedFile: File) => {
		if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
			alert("Please select an .xlsx file.");
			return;
		}

		setFile(selectedFile);
	};

	const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files?.[0];

		if (droppedFile) {
			handleFile(droppedFile);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];

		if (selectedFile) {
			handleFile(selectedFile);
		}
	};

	const handleSubmit = useMutation({
		mutationFn: async () => {
			await supabase.auth.getUser();

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error("No session found");
			}

			if (!file) {
				throw new Error("No file selected");
			}

			await updateGameStats(gameId, session.access_token, file);
		},
		onSuccess: () => {
			setFile(null);
		},
	});

	return (
		<div className="w-full max-w-md space-y-4">
			<label
				htmlFor="xlsx-upload"
				onDragOver={(e: DragEvent<HTMLLabelElement>) => {
					e.preventDefault();
					e.stopPropagation();
					setIsDragging(true);
				}}
				onDragLeave={(e: DragEvent<HTMLLabelElement>) => {
					e.preventDefault();
					e.stopPropagation();
					setIsDragging(false);
				}}
				onDrop={handleDrop}
				className={`
					flex min-h-48 cursor-pointer flex-col items-center justify-center
					rounded-lg border-2 border-dashed p-6 text-center transition
					${
						isDragging
							? "border-blue-500 bg-blue-50"
							: "border-gray-300 bg-gray-50 hover:bg-gray-100"
					}
				`}
			>
				<input
					id="xlsx-upload"
					type="file"
					accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
					onChange={handleChange}
					className="hidden"
				/>

				{file ? (
					<>
						<p className="font-medium text-gray-900">{file.name}</p>
						<p className="mt-1 text-sm text-gray-500">
							{(file.size / 1024 / 1024).toFixed(2)} MB
						</p>
					</>
				) : (
					<>
						<p className="font-medium text-gray-900">
							Drop your Excel file here
						</p>
						<p className="mt-1 text-sm text-gray-500">
							or click to browse
						</p>
						<p className="mt-2 text-xs text-gray-400">
							.xlsx files only
						</p>
					</>
				)}
			</label>

			<button
				type="button"
				onClick={() => handleSubmit.mutate()}
				disabled={!file || handleSubmit.isPending}
				className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white
					transition hover:bg-blue-700 disabled:cursor-not-allowed
					disabled:opacity-50"
			>
				{handleSubmit.isPending ? "Uploading..." : "Submit"}
			</button>
		</div>
	);
}
