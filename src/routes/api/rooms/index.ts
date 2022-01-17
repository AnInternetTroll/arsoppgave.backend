import { restrict } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { Member, Room } from "../../../models/mod.ts";

export default {
	/**
	 * Query params:
	 * limit: How many elements it can return. Max 200
	 * offset: Offset to get more users other than the first 200
	 * username: A username to find users
	 * @param ctx Oak context
	 */
	async GET(ctx, next) {
		const user = await restrict(ctx);
		if (!user) return await next();

		const members = await Member.where("userId", "=", user.id).get() as
			| Member[]
			| Member;

		const roomsTasks: Promise<Room>[] = Array.isArray(members)
			? members.map((a) => Room.find(a.roomId) as Promise<Room>)
			: [Room.find(members.roomId) as Promise<Room>];

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(await Promise.all(roomsTasks));
	},
} as Route;
