import { DraftResponseDto } from "@/dtos/draftDtos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDraftRequest(draftId: string, token: string) {
	const response = await fetch(`${API_URL}/api/drafts/${draftId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Error fetching draft: ${response.statusText}`);
	}

	const draftData: DraftResponseDto = await response.json();
	return draftData;
}
