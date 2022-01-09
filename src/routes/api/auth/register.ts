import { log, Status } from "../../../deps.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { Log, User, UserLocal } from "../../../models/mod.ts";
import { generateSalt, hashPassword } from "../../../utils/auth.ts";

export default {
	GET(ctx) {
		ctx.throw(Status.NotFound);
	},
	async POST(ctx) {
		const bodyOak = ctx.request.body();

		if (bodyOak.type !== "json") {
			return ctx.throw(Status.BadRequest, "Only JSON allowed");
		}

		const body = await bodyOak.value;

		if (!("username" in body && "password" in body && "email" in body)) {
			ctx.throw(
				Status.BadRequest,
				"Username, email, or password not provided",
			);
		}

		try {
			await User.create({
				username: body.username,
				email: body.email,
			});
		} catch (err) {
			// I honestly don't know how to properly catch this error
			// if (err instanceof SqliteError) {
			log.debug(err);
			return ctx.throw(Status.BadRequest, err.message);
		}

		const user = await User.where("email", "=", body.email).first() as User;
		const salt = generateSalt();

		await UserLocal.create({
			salt,
			hash: await hashPassword(body.password, salt),
			userId: user.id,
		});

		await Log.create({
			userId: user.id,
			action: "ADD",
		});

		ctx.response.status = Status.NoContent;
	},
} as Route;
