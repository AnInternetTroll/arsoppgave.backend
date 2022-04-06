import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { User } from "./user.ts";
import { IdDefault, IdField } from "./utils.ts";

export class UserLocal extends Model {
	static table = "users_local";
	static timestamps = true;

	id!: string;
	hash!: string;
	salt!: string;

	static fields: ModelFields = {
		id: IdField,
		hash: { type: DataTypes.STRING, allowNull: false },
		salt: { type: DataTypes.STRING, allowNull: false },
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults: ModelDefaults = {
		id: IdDefault,
	};
}
