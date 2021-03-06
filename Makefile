# Change the project name
# Used for the resulting docker/podman image
PROJECT_NAME=arsoppgave.backend
# Change if you want another deno executable
DENO=deno
DIA=dia
CONTAINER_ENGINE=$(shell which podman 2> /dev/null || which docker)
# These are the variables the server uses
# They should be also put in a `.env` file
ENV_VARS=PORT,SQLITE,ADMIN_USERNAME,ADMIN_PASSWORD,ADMIN_EMAIL,LOG_LEVEL,ENVIORMENT
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
	--no-check \
	--no-prompt

# If this crashes in prod I better have some good stack trace of it
run:
	RUST_BACKTRACE=full ENVIORMENT=production $(DENO) run $(DENO_FLAGS) main.ts

dev:
	RUST_BACKTRACE=full ENVIORMENT=development $(DENO) run --watch $(DENO_FLAGS) main.ts

test:
	rm -rf cov
	RUST_BACKTRACE=full LOG_LEVEL=CRITICAL ENVIORMENT=development $(DENO) test $(DENO_FLAGS) --coverage=cov

container-build:
	$(CONTAINER_ENGINE) build -t $(PROJECT_NAME) .

container-run:
	$(CONTAINER_ENGINE) run -dt -p 8080:8080 $(PROJECT_NAME)

container-dev:
	$(CONTAINER_ENGINE) run -it -p 8080:8080 $(PROJECT_NAME)

coverage:
	$(DENO) coverage cov --lcov > lcov.info
	genhtml -o cov/html lcov.info

diagram:
	$(DIA) -e diagrams/routes.png -t png diagrams/routes.dia
	$(DIA) -e diagrams/schema.png -t png diagrams/schema.dia
	$(DIA) -e diagrams/auth_flow.png -t png diagrams/auth_flow.dia

fmt:
	$(DENO) fmt --config=$(CONFIG) --ignore=cov

lint:
	$(DENO) lint --config=$(CONFIG)

check: test lint
	$(DENO) fmt --config=$(CONFIG) --ignore=cov --check

prep: fmt lint test coverage
