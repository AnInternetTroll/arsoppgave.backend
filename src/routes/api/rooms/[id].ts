import { Status } from "../../../../deps.ts";
import { authenticate } from "../../../middleware/auth.ts";
import type { Route } from "../../../middleware/types.d.ts";
import { Member, Room } from "../../../models/mod.ts";

export default {
	async GET(ctx, next) {
		const user = await authenticate(ctx);
		if (!user) return await next();
		// @ts-ignore what?
		const room = await Room.find(ctx?.params?.id) as Room;
		if (!room) return ctx.throw(Status.NotFound);
		const membersQuery = await Member.where("roomId", "=", room.id).get() as
			| Member[]
			| Member;
		const members = Array.isArray(membersQuery) ? membersQuery : [membersQuery];

		if (user.role === "user") {
			if (
				members.filter(
					(member) => member.id === user.id,
				)
			) {
				return ctx.throw(Status.NotFound);
			}
		}
		ctx.response.headers.set("content-type", "application/json");
		ctx.response.body = JSON.stringify({
			id: room.id,
			owner: room.ownerId,
			members,
		});
	},
} as Route;
