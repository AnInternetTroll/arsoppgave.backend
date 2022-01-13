import { helpers } from "../../../deps.ts";
import { restrict } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { Room, Member } from "../../../models/mod.ts";

export default {
	/**
	 * Query params:
	 * limit: How many elements it can return. Max 200
	 * offset: Offset to get more users other than the first 200
	 * username: A username to find users
	 * @param ctx Oak context
	 */
	async GET(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		const params = helpers.getQuery(ctx, { mergeParams: true });

		let query = Room;

		if ("limit" in params && parseInt(params.limit) > 200) {
			query = query.limit(parseInt(params.limit) || 20);
		}
		if ("offset" in params) query = query.offset(parseInt(params.offset) || 0);
		if ("orderby" in params) query = query.orderBy(params.orderby || "");

		const rooms = await query.get() as Room[] | Room;

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(Array.isArray(rooms) ? rooms : [rooms]);
	},
} as Route;
