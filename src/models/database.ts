import { Database, Relationships, SQLite3Connector } from "../../deps.ts";
import { config } from "../config.ts";
import { log } from "../log.ts";
import { generateSalt, hashPassword } from "../utils/auth.ts";
import {
	Log,
	Member,
	Room,
	Token,
	User,
	UserDiscord,
	UserLocal,
} from "./mod.ts";

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
Relationships.belongsTo(Token, User);
Relationships.belongsTo(Member, Room);
Relationships.belongsTo(Member, User);
Relationships.oneToOne(Room, Member);

try {
	db.link([
		User,
		UserLocal,
		UserDiscord,
		Token,
		Log,
		Member,
		Room,
	]);
	if (config.enviorment === "development") await db.sync({ drop: true });
	else db.sync({ drop: false });
} catch (err) {
	log.error(err);
	// it's probably ok
}

// Add or edit admin user

let admin = await User.find(1) as User;
let shouldUpdate = true;
if (!admin) {
	admin = new User();
	shouldUpdate = false;
}

admin.email = config.adminEmail;
admin.username = config.adminUsername;
admin.role = "super";
admin.id = "1";

let adminLocal = await UserLocal.find("1") as UserLocal;
if (!adminLocal) adminLocal = new UserLocal();
const salt = generateSalt();
adminLocal.salt = salt;
adminLocal.hash = await hashPassword(config.adminPassword, salt);
adminLocal.id = "1";
adminLocal.userId = admin.id;

if (shouldUpdate) {
	await admin.update();
	await adminLocal.update();
} else {
	await admin.save();
	await adminLocal.save();
}
