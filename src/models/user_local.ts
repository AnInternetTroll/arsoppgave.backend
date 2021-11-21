import { DataTypes, Model, snowflake } from "../deps.ts";
import { User } from "./mod.ts";
import { generateSalt } from "../utils/auth.ts";

export class UserLocal extends Model {
	static table = "users_local";
	static timestamps = true;

	id!: string;
	hash!: string;
	salt!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
		hash: { type: DataTypes.STRING, allowNull: false },
		salt: { type: DataTypes.STRING, allowNull: false },
	};

	static user() {
		return this.hasOne(User) as Promise<User>;
	}
}
