import { authenticate } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { Member, Room } from "../../../models/mod.ts";

export default {
	/**
	 * @param ctx Oak context
	 */
	async GET(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		const members = await Member.where("userId", "=", user.id).get() as
			| Member[]
			| Member;

		const roomsTasks: Promise<Room>[] = Array.isArray(members)
			? members.map((member) => Room.find(member.roomId) as Promise<Room>)
			: [Room.find(members.roomId) as Promise<Room>];

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(await Promise.all(roomsTasks));
	},
	async POST(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();

		await Room.create({
			ownerId: user.id,
		});

		const room = await Room.where("ownerId", "=", user.id).first() as Room;

		await Member.create({
			userId: user.id,
			roomId: room.id,
		});

		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify(room);
	},
} as Route;
