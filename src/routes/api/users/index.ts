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

		let query = User;

		if ("limit" in params && parseInt(params.limit) > 200) {
			query = User.limit(parseInt(params.limit) || 20);
		}
		if ("offset" in params) query = query.offset(parseInt(params.offset) || 0);
		if ("orderby" in params) query = query.orderBy(params.orderby || "");

		if ("username" in params) {
			query = query.where("username", "like", params.username);
		}

		const users = await query.get();

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(Array.isArray(users) ? users : [users]);
	},
} as Route;
