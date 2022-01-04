import { join, relative, Router } from "../deps.ts";
import type { Route } from "../middleware/types.d.ts";

export const router = new Router();

/**
 * Add routes to `router` from a folder.
 * @param dir A URL to the folder with files that export `Route`s
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

		// Import the routes and name them something better than `default`
		const { default: routes } = await import(
			new URL(path, import.meta.url).toString()
		) as { default: Route };

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

			// @ts-ignore The routes are defined in the `Route` object keys, so this should work
			router[method.toLowerCase()](
				urlPath,
				// @ts-ignore same thing
				routes[method],
			);
		}
	}
}

await readDir(new URL("./api/", import.meta.url), router);
