import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { User } from "./mod.ts";
import { IdDefault, IdField } from "./utils.ts";

export class Token extends Model {
	static table = "tokens";
	static timestamps = true;

	id!: string;
	token!: string;
	exp!: Date;
	scope!: string;
	userId!: number;

	static fields: ModelFields = {
		id: IdField,

		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		exp: {
			type: DataTypes.INTEGER,
			// No expiration tokens sound like a bad idea
			allowNull: false,
		},

		// Budget oauth2 right here
		scope: DataTypes.enum(["read", "write", "readwrite"]),
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults: ModelDefaults = {
		id: IdDefault,
		scope: "read",
	};
}
