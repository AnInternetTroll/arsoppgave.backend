import { Application } from "../deps.ts";
import { config } from "../config.ts";
import type { Route } from "../middleware/types.d.ts";

const app = new Application();

for await (const file of Deno.readDir("./routes")) {
    const routes = await import("./api");
}

app.listen(`:${config.port}`);