import { helpers } from "../../../deps.ts";
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
		const params = helpers.getQuery(ctx, { mergeParams: true });

		if ("limit" in params && parseInt(params.limit) > 200) params.limit = "200";

		let query = User.limit(parseInt(params.limit) || 20)
			.offset(parseInt(params.offset) || 0).orderBy(params.orderby || "");

		if ("username" in params) {
			query = query.where("username", "like", params.username);
		}

		const users = await query.get() as User[];

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(users);
	},
} as Route;
