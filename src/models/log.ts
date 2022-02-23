import { DataTypes, Model } from "../../deps.ts";
import { log } from "../log.ts";

export class Log extends Model {
	static table = "logs";
	static timestamps = true;

	id!: number;
	message!: string;
	level!: log.LevelName;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },

		message: DataTypes.STRING,

		level: DataTypes.enum(Object.values(log.LogLevels)),
	};

	static defaults = {
		message: "No message provided.",
	};
}
