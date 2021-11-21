import { DataTypes, Model } from "../deps.ts";
import { Grant, User } from "./mod.ts";

// A client is an application
// That uses oauth2 to log in on behalf of a user
export class Client extends Model {
	static table = "clients";
	static timestamps = true;

	/** A unique identifier. */
	id!: string;
	/** Client specific lifetime of access tokens in seconds. */
	accessTokenLifetime!: number | null;
	/** Client specific lifetime of refresh tokens in seconds. */
	refreshTokenLifetime!: number | null;

	static fields = {
		id: { primaryKey: true, autoIncrement: false, type: DataTypes.STRING },
		accessTokenLifetime: { type: DataTypes.INTEGER, allowNull: true },
		refreshTokenLifetime: { type: DataTypes.INTEGER, allowNull: true },
	};

	/** Grant types allowed for the client. */
	static grants() {
		return this.hasMany(Grant);
	}

	/** Redirect URIs allowed for the client. Required for the `authorization_code` grant type. */
	static redirectUris() {
		return this.hasMany(Grant);
	}

	static user() {
		return this.hasOne(User);
	}
}
