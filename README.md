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
