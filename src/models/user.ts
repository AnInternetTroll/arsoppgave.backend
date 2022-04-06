import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { IdDefault, IdField } from "./utils.ts";

export class User extends Model {
	static table = "users";
	static timestamps = true;

	id!: string;
	username!: string;
	email!: string;
	role!: "user" | "admin" | "super";

	static fields: ModelFields = {
		id: IdField,
		username: { type: DataTypes.STRING, unique: true, allowNull: false },
		email: { type: DataTypes.STRING, unique: true, allowNull: false },
		role: DataTypes.enum(["user", "admin", "super"]),
	};

	static defaults: ModelDefaults = {
		id: IdDefault,
		role: "user",
	};
}
