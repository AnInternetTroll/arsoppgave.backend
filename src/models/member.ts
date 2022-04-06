import { DataTypes, Model } from "../../deps.ts";
import type { ModelDefaults, ModelFields } from "../../deps.ts";
import { Room, User } from "./mod.ts";
import { IdDefault, IdField } from "./utils.ts";

export class Member extends Model {
	static table = "members";
	static timestamps = true;

	id!: string;
	userId!: number;
	roomId!: number;

	static fields: ModelFields = {
		id: IdField,
		read: DataTypes.BOOLEAN,
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static room(): Promise<Room> {
		return this.hasOne(Room) as Promise<Room>;
	}

	static defaults: ModelDefaults = {
		id: IdDefault,
		read: false,
	};
}
