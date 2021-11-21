import { DataTypes, Model } from "../deps.ts";

export class RedirectUri extends Model {
	static table = "redirect_uris";
	static timestamps = true;

	id!: string;
	uri!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: true, type: DataTypes.STRING },
		uri: DataTypes.STRING,
	};
}
