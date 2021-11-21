import { DataTypes, Model } from "../deps.ts";
import { Room, User } from "./mod.ts";

export class Message extends Model {
	static table = "messages";
	static timestamps = true;

	id!: string;
	content!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		content: DataTypes.STRING,
	};

	static author() {
		return this.hasOne(User) as Promise<User>;
	}

	static room() {
		return this.hasOne(Room) as Promise<Room>;
	}
}
