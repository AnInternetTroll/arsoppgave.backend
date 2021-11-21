import { DataTypes, Model } from "../deps.ts";

export class Grant extends Model {
	static table = "grants";
	static timestamps = true;

	id!: number;
	grant!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.INTEGER },
		grant: DataTypes.enum(["authorization_code", "refresh_token"]),
	};

	static defaults = {
		grant: "authorization_code",
	};
}
