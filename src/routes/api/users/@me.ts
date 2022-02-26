import type { Route } from "../../../middleware/types.d.ts";
import { authenticate } from "../../../middleware/auth.ts";
import { Status } from "../../../../deps.ts";
import { Token, UserLocal } from "../../../models/mod.ts";
import { log } from "../../../log.ts";
import { patchUser } from "../../../utils/auth.ts";

export default {
	async GET(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		ctx.response.headers.set("content-type", "application/json");

		ctx.response.body = JSON.stringify(user);
	},
	async DELETE(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		// Delete all info we have on the user
		await UserLocal.where("userId", "=", user.id).delete();
		await Token.where("userId", "=", user.id).delete();
		await user.delete();

		// How do you save a log of someone who is deleted?
		log.info(`User [${user.username}] (${user.id}) has been DELETED`);

		ctx.response.status = Status.NoContent;
	},
	async PATCH(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		await patchUser(ctx, user);
	},
} as Route;
