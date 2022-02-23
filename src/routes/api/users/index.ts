import { helpers } from "../../../../deps.ts";
import { authenticate } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { User } from "../../../models/mod.ts";

export default {
	/**
	 * Query params:
	 * limit: How many elements it can return. Max 200
	 * offset: Offset to get more users other than the first 200
	 * username: A username to find users
	 * @param ctx Oak context
	 */
	async GET(ctx) {
		const user = await authenticate(ctx, false);
		const params = helpers.getQuery(ctx, { mergeParams: true });

		let query = User;

		if ("limit" in params && parseInt(params.limit) > 200) {
			query = User.limit(parseInt(params.limit) || 20);
		}
		if ("offset" in params) query = query.offset(parseInt(params.offset) || 0);
		if ("orderby" in params) query = query.orderBy(params.orderby || "");

		if ("username" in params) {
			query = query.where("username", "like", params.username);
		}

		const users = await query.get() as User[] | User;
		// Make the query into a list
		// And remove the email as it is sensitive data
		const usersList = (Array.isArray(users) ? users : [users]).map((
			userFromList,
		) => ({
			...userFromList,
			email: user && (user.role === "admin" || user.role === "super")
				? userFromList.email
				: undefined,
		}));

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(usersList);
	},
} as Route;
