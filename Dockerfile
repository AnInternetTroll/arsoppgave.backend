FROM docker.io/alpine:3.15.0
# glibc is required for deno
FROM docker.io/frolvlad/alpine-glibc:alpine-3.13

RUN apk add --update gnupg make

# A small init system
# Not sure if it's needed or not
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini.asc /tini.asc
RUN gpg --batch --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 595E85A6B1B4779EA4DAAEC70B588DFF0527A9B7 \
	&& gpg --batch --verify /tini.asc /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Download deno
ARG DENO_VERSION=1.19.0
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

RUN make test

CMD ["make", "run"]
