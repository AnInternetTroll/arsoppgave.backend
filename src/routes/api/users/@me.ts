import type { Route } from "../../../middleware/types.d.ts";
import { restrict } from "../../../middleware/auth.ts";
import { Status } from "../../../deps.ts";
import { Token, UserLocal } from "../../../models/mod.ts";

export default {
	async GET(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		ctx.response.headers.set("content-type", "application/json");

		// @ts-ignore Deleting this since it's private information
		delete user.email;
		ctx.response.body = JSON.stringify(user);
	},
	async DELETE(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		// Delete all info we have on the user
		await UserLocal.where("userId", "=", user.id).delete();
		await Token.where("userId", "=", user.id).delete();
		await user.delete();

		ctx.response.status = Status.NoContent;
	},
	async PATCH(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		if (user.role === "super") {
			return ctx.throw(
				Status.Forbidden,
				"Superes may only be changed with the config file.",
			);
		}

		const bodyObj = ctx.request.body();

		if (bodyObj.type !== "json") {
			ctx.throw(Status.BadRequest, "Only JSON allowed");
		}

		const body = await bodyObj.value;

		user.username = body.username;

		const newUser = await user.update();

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(newUser);
	},
} as Route;
