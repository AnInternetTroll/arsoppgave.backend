import { SQLite3Connector, Database } from "../deps.ts";
import { config } from "../config.ts";

let connector;

if (config.sqlite) {
  connector = new SQLite3Connector({
    filepath: config.sqlite,
  })
} else throw new Error("Only SQLITE is supported")

export const db = new Database(connector);

