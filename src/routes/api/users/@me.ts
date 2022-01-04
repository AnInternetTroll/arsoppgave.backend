import type { Route } from "../../../middleware/types.d.ts";
import { Status } from "../../../deps.ts";

export default {
	GET(ctx) {
		ctx.response.headers.set("content-type", "application/json");
		ctx.response.status = Status.NotImplemented;
		ctx.response.body = JSON.stringify({ message: "Not ready" });
	},
} as Route;
