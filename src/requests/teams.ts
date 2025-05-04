export async function getAllTeams() {
    const response = await fetch("http://localhost:3000/api/teams", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch teams");
    }

    return response.json();
}
