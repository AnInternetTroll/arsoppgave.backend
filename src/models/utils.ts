import type { FieldType, FieldValue } from "../../deps.ts";
import { DataTypes, snowflake } from "../../deps.ts";

export const IdField: FieldType = {
	type: DataTypes.STRING,
	primaryKey: true,
};

export const IdDefault: (() => FieldValue) = snowflake;
