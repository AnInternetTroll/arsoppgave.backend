// Handles `.env` file.
// Technically can be ignored as you can always set env variables yourself.
import "https://deno.land/x/dotenv@v3.1.0/load.ts";

interface IConfig {
	// HTTP port to be used
	port: number;
	// File path to sqlite database
	sqlite: string;
	adminUsername: string;
	adminPassword: string;
	adminEmail: string;
	logLevel: "NOTSET" | "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
}

export const config: IConfig = {
	port: parseInt(Deno.env.get("PORT") || "8080"),
	sqlite: Deno.env.get("SQLITE")!,
	adminUsername: Deno.env.get("ADMIN_USERNAME")!,
	adminPassword: Deno.env.get("ADMIN_PASSWORD")!,
	adminEmail: Deno.env.get("ADMIN_EMAIL")!,
	// @ts-ignore probably fine
	logLevel: Deno.env.get("LOG_LEVEL") || "INFO",
};
