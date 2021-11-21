import { DataTypes, Model } from "../deps.ts";
import { Client, RedirectUri, User } from "./mod.ts";

export class AuthorizationCode extends Model {
	static table = "authorization_codes";
	static timestamps = true;

	id!: string;
	code!: string;
	expiresAt!: string;
	scope!: string;
	challenge!: string;

	static fields = {
		id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
		code: DataTypes.STRING,
		expiresAt: { type: DataTypes.STRING },
		scope: DataTypes.enum(["identify", "email", "all.read", "all.write", "all"]),
		challenge: { type: DataTypes.STRING },
	};

	static user() {
		return this.hasOne(User);
	}

	static redirectUri() {
		return this.hasOne(RedirectUri);
	}

	static client() {
		return this.hasOne(Client);
	}

}
