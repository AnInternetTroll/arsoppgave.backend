import type { Route } from "../../../middleware/types.d.ts";
import { User } from "../../../models/mod.ts";

export default {
	async GET(ctx) {
		// @ts-ignore what?
		const user = await User.find(ctx?.params?.id);

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(user);
	},
} as Route;
