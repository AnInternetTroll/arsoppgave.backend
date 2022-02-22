FROM docker.io/ubuntu:jammy

ARG DENO_VERSION=1.19.0

COPY --from=docker.io/denoland/deno:bin-${DENO_VERSION} /deno /bin/deno
# Install external dependencies
RUN apt update
RUN apt install make

EXPOSE 8080

WORKDIR /app

# Prefer not to run as root.
RUN useradd -ms /bin/bash backend
RUN chown -R backend:backend /app
USER backend

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps.ts .
RUN deno cache --no-check deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --no-check main.ts

RUN make run
