import { Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { User } from "./mod.ts";
import { IdDefault, IdField } from "./utils.ts";

export class Room extends Model {
	static table = "rooms";
	static timestamps = true;

	id!: string;
	ownerId!: number;

	static fields: ModelFields = {
		id: IdField,
	};

	static owner(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults: ModelDefaults = {
		id: IdDefault,
	};
}
