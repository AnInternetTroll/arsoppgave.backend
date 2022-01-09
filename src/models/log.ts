import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Log extends Model {
	static table = "logs";
	static timestamps = true;

	id!: number;
	message!: string;
	action!: "DELETE" | "ADD";
	userId!: number;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },

		message: DataTypes.STRING,

		action: DataTypes.enum(["DELETE", "ADD"]),
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults = {
		message: "No message provided.",
	};
}
