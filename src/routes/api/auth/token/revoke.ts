import { Status } from "../../../../deps.ts";
import { restrict } from "../../../../middleware/auth.ts";
import type { Route } from "../../../../middleware/types.d.ts";
import { Token } from "../../../../models/mod.ts";

export default {
	GET(ctx) {
		ctx.throw(Status.NotFound);
	},
	async POST(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		const bodyObj = ctx.request.body();
		if (bodyObj.type !== "json") {
			ctx.throw(Status.BadRequest, "Only JSON allowed");
		}
		const body: { token: string } = await bodyObj.value;

		if (!("token" in body)) ctx.throw(Status.BadRequest, "No token provided");

		const token = await Token.where("token", "=", body.token).first() as Token;

		if (!token) return ctx.throw(Status.NotFound, "No token found");

		if (token.userId === user.id) await token.delete();
		else return ctx.throw(Status.NotFound, "No token found");

		ctx.response.status = Status.NoContent;
	},
} as Route;
