import { config } from "./config.ts";
import { log } from "../deps.ts";

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
