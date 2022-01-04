import type { Middleware } from "../deps.ts";
import { Status } from "../deps.ts";

/* Not implemented yet */
export const restrict: Middleware = (ctx, next) => {
	const header = ctx.request.headers.get("authorization");
	if (!header) ctx.throw(Status.Unauthorized, "Not logged in.");
	next();
};
