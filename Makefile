# Change if you want another deno executable
DENO=deno
DIA=dia

# These are the variables the server uses
# They should be also put in a `.env` file
ENV_VARS=PORT,SQLITE,ADMIN_USERNAME,ADMIN_PASSWORD,ADMIN_EMAIL,LOG_LEVEL
WRITE_FILES=database.sqlite,database.sqlite-journal,server.log

# This configuration file is used for `fmt` and `lint`
# But if needed it can be used for `compilerOptions` as well to customise typescript
# Wouldn't really recommend
CONFIG=deno.jsonc

# These flags will be used for `run` and `test` and `compile` and what not
DENO_FLAGS=\
	--allow-read=. \
	--allow-write=$(WRITE_FILES) \
	--allow-env=$(ENV_VARS) \
	--allow-net \
	--config=$(CONFIG) \
	--unstable \
	--no-check

# If this crashes in prod I better have some good stack trace of it
run:
	RUST_BACKTRACE=full $(DENO) run $(DENO_FLAGS) src/mod.ts

dev:
	RUST_BACKTRACE=full $(DENO) run --watch $(DENO_FLAGS) src/mod.ts

test:
	rm -rf cov
	RUST_BACKTRACE=full LOG_LEVEL=DEBUG $(DENO) test $(DENO_FLAGS) --coverage=cov

coverage: 
	$(DENO) coverage cov --lcov > lcov.info
	genhtml -o cov/html lcov.info

diagram:
	$(DIA) -e diagrams/routes.png -t png diagrams/routes.dia
	$(DIA) -e diagrams/schema.png -t png diagrams/schema.dia

fmt:
	$(DENO) fmt --config=$(CONFIG) --ignore=cov 

lint:
	$(DENO) lint --config=$(CONFIG)

prep: fmt lint test coverage
