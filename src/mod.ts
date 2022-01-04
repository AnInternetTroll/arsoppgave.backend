import { config } from "./config.ts";
import { Application } from "./deps.ts";
import { router } from "./routes/mod.ts";
import "./models/database.ts";

const app = new Application();

// `controller.abort()` can close the server gracefully
// Would use it with the `Deno.addSignalListener` API but it's quite unstable
// https://github.com/denoland/deno/issues/13271
const controller = new AbortController();

app.addEventListener("listen", ({ hostname, port, secure }) =>
	console.log(
		`Listening on: ${secure ? "https://" : "http://"}${
			hostname ??
				"localhost"
		}:${port}`,
	));
app.addEventListener("error", (evt) => console.log(evt.error));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: config.port, signal: controller.signal });
