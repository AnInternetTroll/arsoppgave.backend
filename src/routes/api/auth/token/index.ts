import { helpers, Status } from "../../../../deps.ts";
import type { Route } from "../../../../middleware/types.d.ts";
import { Token, User, UserLocal } from "../../../../models/mod.ts";
import { hashPassword } from "../../../../utils/auth.ts";

export default {
	async GET(ctx) {
		// This will hold at least the expiration time from now
		// for example: 7200000
		const params = helpers.getQuery(ctx, { mergeParams: true });

		const header = ctx.request.headers.get("authorization");
		if (!header) {
			return ctx.throw(Status.Unauthorized, "No Authorization header provided");
		}

		const methodAndValue = header.split(" ");

		if (methodAndValue.length !== 2) {
			return ctx.throw(
				Status.Unauthorized,
				"Too many spaces in the authorization header",
			);
		}

		const [method, value] = methodAndValue;

		switch (method) {
			// If basic then the value should be
			// btoa(email + ":" + password)
			case "Basic": {
				const decodedValue = atob(value);
				const emailAndPassword = decodedValue.split(":");

				if (emailAndPassword.length !== 2) {
					return ctx.throw(
						Status.Unauthorized,
						emailAndPassword.length > 2
							? "Too many `:` in the encoded value"
							: "No `:` found in the value",
					);
				}

				const [email, password] = emailAndPassword;

				const user = await User.where("email", "=", email).first() as User;

				if (!user) {
					return ctx.throw(Status.Unauthorized, "Wrong email or password.");
				}

				const userLocal = await UserLocal.where("userId", "=", user.id)
					.first() as UserLocal;

				// If we have a User but not a UserLocal then they probably used SSO
				// Let's lie anyway it's safer
				if (!userLocal) {
					return ctx.throw(Status.Unauthorized, "Wrong email or password.");
				}

				// If we don't lie here we might reveal that a user with that email address exists
				if (userLocal.hash !== await hashPassword(password, userLocal.salt)) {
					return ctx.throw(Status.Unauthorized, "Wrong email or password.");
				}

				// Possibly change this so something else
				const token = crypto.randomUUID();
				// 120 min
				const expirationDefault = 120 * 60 * 1000;
				const expParam = parseInt(params.exp);

				// Don't allow anything longer than 2 hours
				const exp = Date.now() +
					(expirationDefault >= expParam ? expParam : expirationDefault);

				await Token.create({
					exp,
					token,
					scope: "readwrite",
					userId: user.id,
				});

				ctx.response.headers.set("content-type", "application/json");
				ctx.response.status = Status.OK;
				ctx.response.body = JSON.stringify({
					token,
					exp,
				});

				// handle expired tokens properly pls!!!
				// setTimeout(() => Token.where("token", "=", token).delete(), exp);

				return;
			}
			// If the method is "Bearer" then we should check for the token
			case "Bearer": {
				const tokenOld = await Token.where("token", "=", value)
					.first() as Token;

				// Possibly change this so something else
				const token = crypto.randomUUID();
				// 120 min
				const exp = Date.now() + (120 * 60 * 1000);

				await Token.create({
					exp,
					token,
					scope: tokenOld.scope,
					userId: tokenOld.userId,
				});

				ctx.response.headers.set("content-type", "application/json");
				ctx.response.status = Status.OK;
				ctx.response.body = JSON.stringify({
					token,
					exp,
				});

				return;
			}
			default:
				return ctx.throw(Status.Unauthorized, "No valid method used");
		}
	},
} as Route;
