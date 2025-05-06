import jwt from "jsonwebtoken";

export function verifyJwtToken(token: string): string {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);

		if (!decoded) {
			throw new Error("Invalid token");
		}

		return decoded.sub as string;
	} catch (error) {
		console.error(error);
		throw new Error("Invalid token");
	}
}
