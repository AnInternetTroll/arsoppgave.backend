# Change if you want another deno executable
DENO=deno

# These are the variables the server uses
# They should be also put in a `.env` file
ENV_VARS=PORT,SQLITE

# This configuration file is used for `fmt` and `lint`
# But if needed it can be used for `compilerOptions` as well to customise typescript
# Wouldn't really recommend
CONFIG=deno.jsonc

# These flags will be used for `run` and `test` and `compile` and what not
DENO_FLAGS=\
	--allow-read=. \
	--allow-write=database.sqlite,database.sqlite-journal \
	--allow-env=$(ENV_VARS) \
	--allow-net \
	--config=$(CONFIG)

# If this crashes in prod I better have some good stack trace of it
run:
	RUST_BACKTRACE=full $(DENO) run --no-check $(DENO_FLAGS) src/mod.ts

dev:
	RUST_BACKTRACE=full $(DENO) run --watch $(DENO_FLAGS) src/mod.ts

test:
	RUST_BACKTRACE=full $(DENO) test $(DENO_FLAGS)

fmt:
	$(DENO) fmt --config=$(CONFIG) .

lint:
	$(DENO) lint --config=$(CONFIG)

prep: fmt lint test
