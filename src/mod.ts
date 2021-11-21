import { Application } from "./deps.ts";
import { routes } from "./routes/mod.ts";
import { config } from "./config.ts";

export const app = new Application();

app.use(routes.routes());
app.use(routes.allowedMethods());

if (import.meta.main) {
	app.listen({
		port: config.port,
	});
}
