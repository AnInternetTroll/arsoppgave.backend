import { type Context, Status } from "../../deps.ts";
import { Token } from "../models/mod.ts";
import { User } from "../models/user.ts";
import { UserLocal } from "../models/user_local.ts";
import { hashPassword } from "../utils/auth.ts";

/**
 * There are 2 ways a user can authenticate,
 * either with a `Basic` header or a `Bearer` header
 *
 * `Authorization: Basic ${btoa("email:password")}
 * `Authorization: Bearer 564bd344-653e-44c5-8616-c45be04a6b8f
 *
 * If `Basic` is used then we check the database for a user with that email
 * Then we check if we have a UserLocal for that user
 * Then we check if the password matches our salted hash
 *
 * If `Bearer` is used then we check for a token like the one provided
 */
export const restrict: (ctx: Context) => Promise<false | User> = async (
	ctx,
) => {
	const header = ctx.request.headers.get("authorization");

	if (!header) {
		ctx.throw(Status.Unauthorized, "No Authorization header provided");
		return false;
	}

	const methodAndValue = header.split(" ");

	if (methodAndValue.length !== 2) {
		ctx.throw(
			Status.Unauthorized,
			"Too many spaces in the authorization header",
		);
		return false;
	}

	const [method, value] = methodAndValue;

	let user: User;

	let decodedValue: string;
	switch (method.toLowerCase()) {
		// If basic then the value should be
		// btoa(email + ":" + password)
		case "basic": {
			try {
				decodedValue = atob(value);
			} catch {
				ctx.throw(Status.Unauthorized, "Invalid Basic value");
				return false;
			}
			const emailAndPassword = decodedValue.split(":");

			if (emailAndPassword.length !== 2) {
				ctx.throw(
					Status.Unauthorized,
					emailAndPassword.length > 2
						? "Too many `:` in the encoded value"
						: "No `:` found in the value",
				);
				return false;
			}

			const [email, password] = emailAndPassword;

			user = await User.where("email", "=", email).first() as User;

			if (!user) {
				ctx.throw(Status.Unauthorized, "Wrong email or password.");
				return false;
			}

			const userLocal = await UserLocal.where("userId", "=", user.id)
				.first() as UserLocal;

			// If we have a User but not a UserLocal then they probably used SSO
			// Let's lie anyway it's safer
			if (!userLocal) {
				ctx.throw(Status.Unauthorized, "Wrong email or password.");
				return false;
			}

			// If we don't lie here we might reveal that a user with that email address exists
			if (userLocal.hash !== await hashPassword(password, userLocal.salt)) {
				ctx.throw(Status.Unauthorized, "Wrong email or password.");
				return false;
			}
			break;
		}
		// If the method is "bearer" then we should check for the token
		case "bearer": {
			const tokenOld = await Token.where("token", "=", value)
				.first() as Token;

			if (!tokenOld) {
				ctx.throw(Status.Forbidden);
				return false;
			}

			// @ts-ignore DenoDB types are wack
			// https://eveningkid.com/denodb-docs/docs/guides/foreign-key#query-models
			user = await User.find(tokenOld.userId);

			break;
		}
		default: {
			ctx.throw(Status.BadRequest, "No valid auth method found.");
			return false;
		}
	}
	return user;
};
