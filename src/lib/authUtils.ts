import jwt from "jsonwebtoken";

type JWTToken = {
	sub: string;
	iat: number;
	exp: number;
	user_role: string;
};

export function verifyJwtToken(token: string): string {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTToken;

		if (!decoded) {
			throw new Error("Invalid token");
		}

		return decoded.sub;
	} catch (error) {
		console.error(error);
		throw new Error("Invalid token");
	}
}

export function getUserRoleFromToken(token: string): string {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTToken;

		if (!decoded) {
			throw new Error("Invalid token");
		}

		return decoded.user_role;
	} catch (error) {
		console.error(error);
		return "team";
	}
}
