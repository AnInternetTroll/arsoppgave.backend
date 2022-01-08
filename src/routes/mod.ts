import { isHttpError, join, log, relative, Router, Status } from "../deps.ts";
import type { Route } from "../middleware/types.d.ts";

export const router = new Router();

router.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		if (isHttpError(err)) {
			switch (err.status) {
				case Status.Unauthorized: {
					// Handle here ish stuff
					break;
				}
			}
			ctx.response.status = err.status;
			ctx.response.headers.set("content-type", "application/json");
			ctx.response.body = JSON.stringify({
				message: err.message,
				stack: err.stack,
			});
		}
	}
});

// How else should I check for route if idk what route is
// deno-lint-ignore no-explicit-any
function isRoute(route: any): route is Route {
	if ("GET" in route) {
		const keys = Object.keys(route);
		if (
			keys.filter((a) =>
				a === "GET" || a === "POST" || a === "PATCH" || a === "DELETE"
			).length === keys.length
		) {
			return true;
		}
	}
	return false;
}

/**
 * Add routes to `router` from a folder.
 * A route is any JS or TS file that can be imported.
 * For example
 *
 * ```
 * hello/
 *   world.ts
 * ```
 *
 * Will give us the route `/hello/world`
 *
 * ```
 * hello/
 *   world/
 *     [id].ts
 *     index.ts
 *     beep.ts
 * ```
 *
 * Will give us
 * `/hello/world/:id`
 * `/hello/world`
 * `/hello/world/beep`
 *
 * @param dir A URL to the folder with files that export `Route`s
 * @param router The router where those routes get added
 */
async function readDir(dir: URL, router: Router): Promise<void> {
	for await (const file of Deno.readDir(dir)) {
		// This returns an absolute URL
		// /home/user/project/src/routes/etc...
		const path = join(dir.pathname, file.name);

		// If the entry is a folder
		// *recurse*
		if (file.isDirectory) {
			await readDir(new URL(path, import.meta.url), router);
			continue;
		}
		let routes: Route;
		try {
			// Import the routes and name them something better than `default`
			routes = (await import(
				new URL(path, import.meta.url).toString()
			)).default;

			if (!isRoute(routes)) continue;
		} catch (err) {
			// If there's an error in a route then don't crash the server
			// Possible use case can also be having utility files with functions and stuff other than routes
			log.error(err);
			continue;
		}

		// Each route has methods, such as GET, POST, etc as keys.
		for (const method in routes) {
			// 1) Transform the path from an absolute path to a relative path
			// 2) Make it so it's relative to the folder, not the file
			// 3) Replace [param] with :param so oak can take care of the rest
			// 4) Remove `.ts` extensions from paths and `index.ts` completely
			// 5) Add a "/" at the beginning
			// Congrats, you now have a mess
			// Shouldn't be tooooooo slow, it only gets ran at the start and never again
			const urlPath = "/" +
				relative(new URL(import.meta.url + "/..").pathname, path).replaceAll(
					/\[(.*?)\]/g,
					":$1",
				).replace(/(\.ts)|(\.js)|(\/index(\.ts|\.js))/, "");

			log.debug(`${urlPath} ${method}`);

			// @ts-ignore why are you like this typescript
			router[method.toLowerCase() as "get" | "post" | "patch" | "delete"](
				urlPath,
				// @ts-ignore Dynamic types are wack, so just trust me on this
				routes[method],
			);
		}
	}
}

await readDir(new URL("./api/", import.meta.url), router);
