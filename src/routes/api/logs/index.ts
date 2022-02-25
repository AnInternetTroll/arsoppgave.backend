import type { Route } from "../../../middleware/types.d.ts";
import { authenticate } from "../../../middleware/auth.ts";
import { helpers, Status } from "../../../../deps.ts";
import { Log } from "../../../models/mod.ts";

export default {
	async GET(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();
		const params = helpers.getQuery(ctx, { mergeParams: true });

		if (user.role === "user") {
			return ctx.throw(Status.Forbidden, "You are not allowed to see logs");
		}

		let query = Log;

		if ("limit" in params && parseInt(params.limit) > 200) {
			query = query.limit(parseInt(params.limit) || 20);
		}
		if ("offset" in params) query = query.offset(parseInt(params.offset) || 0);
		if ("orderby" in params) query = query.orderBy(params.orderby || "");

		if ("level" in params) {
			query = query.where("level", "=", params.level);
		}

		const logs = await query.get() as Log[] | Log;

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(Array.isArray(logs) ? logs : [logs]);
	},
} as Route;
