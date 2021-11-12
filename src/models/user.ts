import { Model, DataTypes } from "../deps.ts";

export class User extends Model {
  static table = 'users';
  static timestamps = true;

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    username: {type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    role: DataTypes.enum(['user', 'admin', 'super']),
  };

  static defaults = {
    role: "user",
  };
}

