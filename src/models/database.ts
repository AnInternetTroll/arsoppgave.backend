import { Database, SQLite3Connector, Relationships, } from "../deps.ts";
import { config } from "../config.ts";
import { User, UserDiscord, UserLocal } from "./mod.ts";

let connector;

// TODO: Support multiple databases
// SQLITE is nice and all but for performence reasons PostgreSQL should be supported.
if (config.sqlite) {
	connector = new SQLite3Connector({
		filepath: config.sqlite,
	});
} else throw new Error("Only SQLITE is supported");

export const db = new Database(connector);

Relationships.belongsTo(UserLocal, User);
Relationships.belongsTo(UserDiscord, User);

try {
	db.link([
		User, 
		UserLocal, 
		UserDiscord
	]);
	await db.sync({ drop: true });
} catch (err) {
	console.log(err);
	// it's probably ok
}
