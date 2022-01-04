import type { Route } from "../../../middleware/types.d.ts";
import { User } from "../../../models/mod.ts";
import { helpers } from "../../../deps.ts";

export default {
	async GET(ctx) {
		const params = helpers.getQuery(ctx, { mergeParams: true });
		const user = await User.find(params.id);
		ctx.response.body = JSON.stringify(user);
	},
} as Route;
