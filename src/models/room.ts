import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Room extends Model {
	static table = "rooms";
	static timestamps = true;

	id!: number;
	ownerId!: number;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
	};

	static owner(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}
}
