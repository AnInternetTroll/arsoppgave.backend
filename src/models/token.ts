import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Token extends Model {
	static table = "tokens";
	static timestamps = true;

	id!: number;
	token!: string;
	exp!: Date;
	scope!: "full" | "readonly";

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		exp: {
			type: DataTypes.DATE,
			// Should no expiration tokens exist?
			allowNull: false,
		},
		scope: DataTypes.enum(["full", "readonly"]),
	};

	static user() {
		return this.hasOne(User) as Promise<User>;
	}
}
