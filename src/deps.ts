// Handles `.env` file.
// Technically can be ignored as you can always set env variables yourself.
import "https://deno.land/x/dotenv@v3.1.0/load.ts";

// The ORM library. The way to save all kinds of data
export {
	Database,
	DataTypes,
	Model,
	PostgresConnector,
	Relationships,
	SQLite3Connector,
} from "https://deno.land/x/denodb@v1.0.40/mod.ts";

// The HTTP library, handles all requests and responses
export {
	Application,
	helpers,
	Router,
	Status,
	Context,
	type ErrorStatus,
	type Middleware,
	type Route,
} from "https://deno.land/x/oak@v10.1.0/mod.ts";

// Utilities
export {
	encode as encodeHex,
} from "https://deno.land/std@0.119.0/encoding/hex.ts";
export {
	encode as encodeBase64,
} from "https://deno.land/std@0.119.0/encoding/base64.ts";
export {
	join,
	normalize,
	relative,
} from "https://deno.land/std@0.119.0/path/mod.ts";
export * as log from "https://deno.land/std@0.119.0/log/mod.ts";
