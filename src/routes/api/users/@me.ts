import type { Route } from "../../../middleware/types.d.ts";

export default {
	GET(ctx) {
		ctx.response.body = "Not ready";
	},
} as Route;
