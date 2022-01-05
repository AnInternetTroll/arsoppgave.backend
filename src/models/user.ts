import { DataTypes, Model } from "../deps.ts";

export class User extends Model {
	static table = "users";
	static timestamps = true;

	id!: number;
	username!: string;
	email!: string;
	role!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		username: { type: DataTypes.STRING, unique: true, allowNull: false },
		email: { type: DataTypes.STRING, unique: true, allowNull: false },
		role: DataTypes.enum(["user", "admin", "super"]),
	};

	static defaults = {
		role: "user",
	};
}
