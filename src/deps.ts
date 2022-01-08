import { config } from "./config.ts";

// The ORM library. The way to save all kinds of data
export {
	Database,
	DataTypes,
	Model,
	PostgresConnector,
	Relationships,
	SQLite3Connector,
} from "https://deno.land/x/denodb@v1.0.40/mod.ts";

// The HTTP library, handles all requests and responses
export {
	Application,
	Context,
	type ErrorStatus,
	helpers,
	isHttpError,
	type Middleware,
	type Route,
	Router,
	Status,
} from "https://deno.land/x/oak@v10.1.0/mod.ts";

// Utilities
export {
	encode as encodeHex,
} from "https://deno.land/std@0.119.0/encoding/hex.ts";
export {
	encode as encodeBase64,
} from "https://deno.land/std@0.119.0/encoding/base64.ts";
export {
	join,
	normalize,
	relative,
} from "https://deno.land/std@0.119.0/path/mod.ts";
import * as log from "https://deno.land/std@0.119.0/log/mod.ts";
export {
	Session,
	SqliteStore,
} from "https://deno.land/x/oak_sessions@v3.2.3/mod.ts";

await log.setup({
	handlers: {
		console: new log.handlers.ConsoleHandler(config.logLevel),

		file: new log.handlers.FileHandler(config.logLevel, {
			filename: "./server.log",
			formatter: "{levelName} {msg}",
		}),

	},

	loggers: {
		// configure default logger available via short-hand methods above.
		default: {
			level: config.logLevel,
			handlers: ["console", "file"],
		},
	},
});

export { log };