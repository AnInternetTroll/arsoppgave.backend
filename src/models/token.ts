import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Token extends Model {
	static table = "tokens";
	static timestamps = true;

	id!: number;
	token!: string;
	exp!: Date;
	scope!: string;
	userId!: number;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },

		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		exp: {
			type: DataTypes.INTEGER,
			// No expiration tokens sound like a bad idea
			allowNull: false,
		},

		// Budget oauth2 right here
		scope: DataTypes.enum(["read", "write", "readwrite"]),
	};

	static user(): Promise<User> {
		return this.hasOne(User) as Promise<User>;
	}

	static defaults = {
		scope: "read",
	};
}
