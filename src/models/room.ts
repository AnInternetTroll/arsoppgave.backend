import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Room extends Model {
	static table = "rooms";
	static timestamps = true;
	id!: number;
	read!: boolean;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		read: DataTypes.BOOLEAN,
	};

	static users() {
		return this.hasMany(User);
	}

	static defaults = {
		read: true,
	};
}
