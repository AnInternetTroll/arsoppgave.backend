import { DataTypes, Model } from "../deps.ts";
import { User } from "./mod.ts";

export class Session extends Model {
	static table = "sessions";
	static timestamps = true;

	id!: string;
	csrf!: string;
	state!: string | null;
	redirectUri!: string | null;
	codeVerifier!: string | null;
	accessToken!: string | null;
	refreshToken!: string | null;
	accessTokenExpiresAt!: string | null;

	static fields = {
		id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
		csrf: DataTypes.STRING,
		state: { type: DataTypes.STRING, allowNull: true },
		redirectUri: { type: DataTypes.STRING, allowNull: true },
		codeVerifier: { type: DataTypes.STRING, allowNull: true },
		accessToken: { type: DataTypes.STRING, allowNull: true },
		refreshToken: { type: DataTypes.STRING, allowNull: true },
		accessTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
	};

	static user() {
		return this.hasOne(User);
	}
}
