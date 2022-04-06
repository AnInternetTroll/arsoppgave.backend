import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { User } from "./user.ts";
import { IdDefault, IdField } from "./utils.ts";

export class UserDiscord extends Model {
	static table = "users_discord";
	static timestamps = true;

	id!: string;
	discordId!: string;

	static fields: ModelFields = {
		id: IdField,
		discordId: { type: DataTypes.STRING },
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults: ModelDefaults = {
		id: IdDefault,
	};
}
