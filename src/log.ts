import { config } from "./config.ts";
import { log } from "../deps.ts";
import { Log } from "./models/mod.ts";

class DatabaseHandler extends log.handlers.BaseHandler {
	handle(logRecord: log.LogRecord): Promise<Log> | void {
		if (log.LogLevels.INFO > logRecord.level) return;

		const msg = this.format(logRecord);
		return Log.create({
			message: msg,
			level: logRecord.level,
		}) as Promise<Log>;
	}
}

await log.setup({
	handlers: {
		console: new log.handlers.ConsoleHandler(config.logLevel),

		file: new log.handlers.FileHandler(config.logLevel, {
			filename: "./server.log",
			formatter: "{levelName} {msg}",
		}),

		database: new DatabaseHandler(config.logLevel),
	},

	loggers: {
		// configure default logger available via short-hand methods above.
		default: {
			level: config.logLevel,
			handlers: ["console", "file", "database"],
		},
	},
});

export { log };
