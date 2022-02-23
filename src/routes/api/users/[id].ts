import { log } from "../../../log.ts";
import { authenticate } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { User } from "../../../models/mod.ts";

export default {
	async GET(ctx) {
		const authenticatedUser = await authenticate(ctx, false);
		// @ts-ignore what?
		const user = await User.find(ctx?.params?.id) as User;

		// Allow admins, supers, and the user themselves
		// to see their own email
		if (
			!(authenticatedUser &&
				(authenticatedUser.role === "admin" ||
					authenticatedUser.role === "super" ||
					authenticatedUser.id === user.id))
		) {
			// @ts-ignore This is ok because we don't want to leak a user's email
			delete user.email;
		}
		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(user);
	},
} as Route;
