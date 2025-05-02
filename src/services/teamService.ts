import { findAll } from "@/repositories/teamRepository";

export function getAllTeams() {
	return findAll();
}
