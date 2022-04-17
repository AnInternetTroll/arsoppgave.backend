
FROM docker.io/alpine:3.15.3
# glibc is required for deno
FROM docker.io/frolvlad/alpine-glibc:alpine-3.15

ARG TINI_VERSION=v0.19.0
ARG DENO_VERSION=1.20.6

RUN apk add --update gnupg make

# A small init system
# Not sure if it's needed or not
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Download deno
COPY --from=docker.io/denoland/deno:bin-${DENO_VERSION} /deno /bin/deno

EXPOSE 8080

# Prefer not to run as root.
RUN addgroup --gid 1000 backend \
	&& adduser --uid 1000 --disabled-password backend --ingroup backend \
	&& mkdir /deno-dir/ \
	&& chown -R backend:backend /deno-dir/

ENV DENO_DIR /deno-dir/
ENV DENO_INSTALL_ROOT /usr/local

WORKDIR /app

RUN chown -R backend:backend /app/

USER backend

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps.ts .
RUN deno cache --no-check deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --no-check main.ts

CMD ["make", "run"]
