import { Status } from "../../../../deps.ts";
import type { Route } from "../../../../middleware/types.d.ts";
import { Token } from "../../../../models/mod.ts";

export default {
	GET(ctx) {
		ctx.throw(Status.NotFound);
	},
	async POST(ctx) {
		const header = ctx.request.headers.get("authorization");
		if (!header) {
			return ctx.throw(Status.Unauthorized, "No Authorization header provided");
		}

		const methodAndValue = header.split(" ");

		if (methodAndValue.length !== 2) {
			return ctx.throw(
				Status.Unauthorized,
				"Too many spaces in the authorization header",
			);
		}

		const [method, value] = methodAndValue;

		if (method !== "Bearer") ctx.throw(Status.Unauthorized, "Bad method");

		await Token.where("token", "=", value).delete();

		ctx.response.status = Status.NoContent;
	},
} as Route;
