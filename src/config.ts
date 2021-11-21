interface IConfig {
	// HTTP port to be used
	PORT: number;
	// File path to sqlite database
	SQLITE: string;
}

// @ts-ignore TODO: type conversion
export const config: IConfig = Deno.env.toObject() as IConfig;
