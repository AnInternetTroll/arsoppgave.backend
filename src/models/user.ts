import { DataTypes, Model, snowflake } from "../deps.ts";
import { Room } from "./mod.ts";

export class User extends Model {
	static table = "users";
	static timestamps = true;

	id!: string;
	username!: string;
	email!: string;
	role!: string;

	static fields = {
		id: { primaryKey: true, type: DataTypes.STRING, autoIncrement: false },
		username: { type: DataTypes.STRING, unique: true, allowNull: false },
		email: { type: DataTypes.STRING, unique: true, allowNull: false },
		role: DataTypes.enum(["user", "admin", "super"]),
	};

	static rooms() {
		return this.hasMany(Room);
	}

	static defaults = {
		role: "user",
	};
}
