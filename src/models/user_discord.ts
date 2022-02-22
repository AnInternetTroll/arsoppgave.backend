import { DataTypes, Model } from "../../deps.ts";
import { User } from "./user.ts";

export class UserDiscord extends Model {
	static table = "users_discord";
	static timestamps = true;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		discord_id: { type: DataTypes.STRING },
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}
}
