import type { Middleware } from "../deps.ts";

export interface Route {
	GET: Middleware;
	POST?: Middleware;
	PATCH?: Middleware;
	DELETE?: Middleware;
}
