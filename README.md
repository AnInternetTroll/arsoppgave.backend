# Dependencies

- Deno

## Dev dependencise

- Make
- sqlite3
- dia diagram

# Configuration

Configuration is done with enviormental variables (or a `.env` file). Here's an
example of values

```sh
PORT=8080
SQLITE=database.sqlite
ADMIN_USERNAME=luca
ADMIN_PASSWORD=qwer1234
ADMIN_EMAIL=support@localhost.com
LOG_LEVEL=NOTSET
```

# Production

To run in production simply run.

```sh
make run
```

## Docker/Podman

For running in a container there's 2 commands that must be ran

First build the image.

```console
# make container-build
```

Then either run it manually or with

```console
# make container-run
```

One issue with the make script is that it will not have any enviormental
variables set. Ideally you should pass `--env-file=.env` or something similar
([podman(1)](https://docs.podman.io/en/latest/markdown/podman-run.1.html#environment))
