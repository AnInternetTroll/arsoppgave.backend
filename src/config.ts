import "./deps.ts";

interface IConfig {
	// HTTP port to be used
	port: number;
	// File path to sqlite database
	sqlite: string;
}

export const config: IConfig = {
	port: parseInt(Deno.env.get("PORT") || "8080"),
	sqlite: Deno.env.get("SQLITE")!,
};
