import { DataTypes, Model } from "../deps.ts";
import { User } from "./user.ts";

export class UserLocal extends Model {
	static table = "users_local";
	static timestamps = true;

	id!: number;
	hash!: string;
	salt!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		hash: { type: DataTypes.STRING, allowNull: false },
		salt: { type: DataTypes.STRING, allowNull: false },
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}
}
