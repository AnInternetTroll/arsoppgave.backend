#!/usr/bin/env -S deno run --allow-read=. --allow-write=database.sqlite --allow-net --allow-env=SQLITE,PORT --config=./deno.jsonc --no-check
import { config } from "./config.ts";
import { Application, log } from "./deps.ts";
import { router } from "./routes/mod.ts";
import "./models/database.ts";

export const app = new Application();

// `controller.abort()` can close the server gracefully
// Would use it with the `Deno.addSignalListener` API but it's quite unstable
// https://github.com/denoland/deno/issues/13271
export const controller = new AbortController();

app.addEventListener("listen", ({ hostname, port, secure }) => {
	log.info(
		`Listening on: ${secure ? "https://" : "http://"}${
			hostname ??
				"localhost"
		}:${port}`,
	);
});
app.addEventListener("error", (evt) => log.error(evt.error));

app.use(router.routes());
app.use(router.allowedMethods());

export function startServer(port = config.port, signal = controller.signal) {
	return app.listen({ port, signal });
}

if (import.meta.main) {
	startServer();
}
