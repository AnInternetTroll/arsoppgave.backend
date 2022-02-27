# API

This is where the reference documentation for the API resides.

## General reference

- The base URL is `http[s?]://[HOST]:[PORT]/api`.
- All bodies **MUST** be of MIME type `applicattion/json`.
- All responses will be of type `application/json`.
- Query parameters **MUST** be URI encoded.

If any of the points above are false under any circumstance then that is a bug.

## Status codes

| Status | Meaning                               | Example                                                                   |
| ------ | ------------------------------------- | ------------------------------------------------------------------------- |
| 200    | OK                                    | `/users/@me` returns the authenticated user                               |
| 204    | The response does not have a body     | A succesful registration                                                  |
| 400    | The user has done something wrong     | Registering a user with a username that already exists                    |
| 401    | Something went wrong when authorizing | Not base64 encoding the username and password in the authorization header |
| 403    | The user is not allowed to do this    | Trying to patch a user that is not the authenticated user                 |
| 404    | Not found                             | `/users/[id]` user not found                                              |
| 500    | Internal server error                 | Fatal bug, please report                                                  |
