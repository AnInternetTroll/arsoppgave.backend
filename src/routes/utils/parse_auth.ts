import { Token, User, UserLocal } from "../../models/mod.ts";
import { hashPassword } from "../../utils/auth.ts";

interface ParseAuthSuccess {
	err: false;
	type: "Bearer" | "Basic";
	user: User;
	scope: "full" | "readonly";
}

interface ParseAuthFail {
	err: true;
	message: string;
}

export async function parseAuth(
	authorization: string,
): Promise<ParseAuthSuccess | ParseAuthFail> {
	const header = authorization.split(" ") as ["Basic" | "Bearer", string];

	// The header should be in the format
	// TYPE DATA
	// So TYPE is either "Basic" or "Bearer"
	// And data is either btoa(username + ":" + password)
	// or a JWT token
	if (header.length != 2) {
		return {
			err: true,
			message: "Invalid header",
		};
	}

	switch (header[0]) {
		case "Basic": {
			// Username and password
			const credentialsDecoded = atob(header[1]);
			const credentials = credentialsDecoded.split(":") as [string, string];

			if (credentials.length != 2) {
				return {
					err: true,
					message: "Bad credentials.",
				};
			}

			const user = await User.where("username", "=", credentials[0])
				.first() as User;

			if (!user) {
				return {
					err: true,
					message: "No user found with this username.",
				};
			}

			const userLocal = await UserLocal.where("user", "=", user.id)
				.first() as UserLocal;

			if (
				userLocal.hash !== await hashPassword(credentials[1], userLocal.salt)
			) {
				return {
					err: true,
					message: "Wrong password.",
				};
			}

			return {
				err: false,
				type: "Basic",
				user,
				scope: "full",
			};
		}

		case "Bearer": {
			const tokenQuery = Token.where("token", "=", header[1]);
			const token = await tokenQuery.first() as Token;

			if (!token) {
				return {
					err: true,
					message: "Invalid token",
				};
			}

			// If the expiration date is less than the current time
			// The token has expired
			// Delete it while on it
			if (token.exp.getTime() < new Date(Date.now()).getTime()) {
				token.delete();
				return {
					err: true,
					message: "Invalid token",
					// message: "Token expired, please log in again.",
				};
			}

			return {
				user: await tokenQuery.user(),
				err: false,
				type: "Bearer",
				scope: token.scope,
			};
		}

		default:
			return {
				err: true,
				message: "Bad auth method",
			};
	}
}
