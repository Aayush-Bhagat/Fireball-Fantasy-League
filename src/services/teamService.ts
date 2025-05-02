import { findAll, findById } from "@/repositories/teamRepository";

export async function getAllTeams() {
	return findAll();
}

export async function getTeamById(id: string) {
	return findById(id);
}
