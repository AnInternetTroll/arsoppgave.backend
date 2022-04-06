import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { log } from "../log.ts";
import { IdDefault, IdField } from "./utils.ts";

export class Log extends Model {
	static table = "logs";
	static timestamps = true;

	id!: string;
	message!: string;
	level!: string;

	static fields: ModelFields = {
		id: IdField,

		message: DataTypes.STRING,

		level: DataTypes.enum(Object.values(log.LogLevels)),
	};

	static defaults: ModelDefaults = {
		id: IdDefault,
		message: "No message provided.",
	};
}
