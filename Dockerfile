FROM docker.io/alpine:3.15.0
FROM docker.io/buildpack-deps:20.04-curl AS tini

# A small init system
# Not sure if it's needed or not
#ARG TINI_VERSION=0.19.0
#RUN curl -fsSL https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini \
#		--output /tini \
#	&& chmod +x /tini
#COPY --from=tini /tini /tini

# glibc is required for deno
FROM docker.io/frolvlad/alpine-glibc:alpine-3.13

# Download deno
ARG DENO_VERSION=1.19.0
COPY --from=docker.io/denoland/deno:bin-${DENO_VERSION} /deno /bin/deno
# Install external dependencies
RUN apk add --update make


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
