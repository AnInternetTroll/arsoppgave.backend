import type { Route } from "../../../middleware/types.d.ts";
import { User } from "../../../models/mod.ts";

export default {
	async GET(ctx) {
		const users = await User.all() as User[];
		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(users);
	},
} as Route;
