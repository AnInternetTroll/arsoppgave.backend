interface IConfig {
  // HTTP port to be used
  port: number;
  // File path to sqlite database
  sqlite: string;
}

// @ts-ignore TODO: type conversion
export const config: IConfig = Deno.env.toObject() as IConfig;
