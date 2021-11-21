import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Log extends Model {
	static table = "logs";
	static timestamps = true;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		action: DataTypes.enum(["delete", "create"]),
		message: DataTypes.STRING,
	};

	static user() {
		return this.hasOne(User) as Promise<User>;
	}
}
