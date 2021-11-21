import { Database, Relationships, SQLite3Connector } from "../deps.ts";
import { config } from "../config.ts";
import {
	Log,
	Message,
	Room,
	Token,
	User,
	UserDiscord,
	UserLocal,
} from "./mod.ts";

let connector;
if (config.SQLITE) {
	connector = new SQLite3Connector({
		filepath: config.SQLITE,
	});
} else throw new Error("Only SQLITE is supported");

export const db = new Database(connector);

Relationships.belongsTo(UserLocal, User);
Relationships.belongsTo(UserDiscord, User);
Relationships.belongsTo(Log, User);
Relationships.belongsTo(Token, User);
Relationships.belongsTo(Message, User);
Relationships.belongsTo(Message, Room);

Relationships.manyToMany(User, Room);

db.link([
	Log,
	Message,
	Room,
	Token,
	User,
	UserDiscord,
	UserLocal,
]);

db.sync({ drop: true });
