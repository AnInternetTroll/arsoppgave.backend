import { DataTypes, Model } from "../deps.ts";
import { Room, User } from "./mod.ts";

export class Member extends Model {
	static table = "members";
	static timestamps = true;

	id!: number;
	userId!: number;
	roomId!: number;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static room(): Promise<Room> {
		return this.hasOne(Room) as Promise<Room>;
	}
}
