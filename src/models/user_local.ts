import { Model, DataTypes } from "../deps.ts";
import { User } from "./user.ts";
import { generateSalt } from "../utils/auth.ts";

export class UserLocal extends Model {
  static table = 'users';
  static timestamps = true;

  static fields = {
    id: { primaryKey: true, autoIncrement: true, },
    hash: {type: DataTypes.STRING, allowNull: false },
    salt: { type: DataTypes.STRING, allowNull: false },
  };

  static user() {
    this.hasOne(User)
  }

  static defaults = {
    salt: generateSalt
  };
}
