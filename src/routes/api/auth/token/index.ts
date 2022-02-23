import { helpers, Status } from "../../../../../deps.ts";
import type { Route } from "../../../../middleware/types.d.ts";
import { Token } from "../../../../models/mod.ts";
import { authenticate } from "../../../../middleware/auth.ts";

export default {
	async GET(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		// This will hold at least the expiration time from now
		// for example: 7200000
		const params = helpers.getQuery(ctx, { mergeParams: true });
		// Possibly change this so something else
		const token = crypto.randomUUID();
		// 120 min
		const expirationDefault = 120 * 60 * 1000;
		const expParam = parseInt(params.exp);
		const expirationTime = expirationDefault >= expParam
			? expParam
			: expirationDefault;
		// Don't allow anything longer than 2 hours
		const exp = Date.now() + expirationTime;
		await Token.create({
			exp,
			token,
			scope: "readwrite",
			userId: user.id,
		});

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.status = Status.OK;
		ctx.response.body = JSON.stringify({
			token,
			exp,
		});

		// handle expired tokens properly pls!!!
		setTimeout(() => Token.where("token", "=", token).delete(), expirationTime);
	},
} as Route;
