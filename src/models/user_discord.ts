import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class UserDiscord extends Model {
	static table = "users_discord";
	static timestamps = true;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		discord_id: { type: DataTypes.STRING, allowNull: false },
	};

	static user() {
		return this.hasOne(User) as Promise<User>;
	}
}
