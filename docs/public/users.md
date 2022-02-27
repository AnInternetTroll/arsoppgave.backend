# Users

This is the endpoint with anything relating users. A user object looks like this

```json
{
	// `int` SQL ID
	"id": 1,
	// `string` User's username
	"username": "luca",
	// `string` user's email. Only available to users with the role `admin` or `super` or to the authenticated user
	"email": "support@localhost.com",
	// `"user" | "super" | "admin"` A user's role. Only `admins` can change this
	"role": "admin"
}
```

## `/users`

### GET

Returns a list of `user`s

| Query parameter | Type   | Description                                                                |
| --------------- | ------ | -------------------------------------------------------------------------- |
| `username`      | string | A user's username. Returns all users with a username like the one provided |

```json
[
	<User>,
	<User>,
	...
]
```

## `/users/[id]`

### GET

Returns a user object

### PATCH

Edit a user. May be used by `admin`, `super` or the authenticated user if they
are editing themselves.

The only fields allowed are:

- `username`

```json
{
	"username": "new-username-here"
}
```

## `/users/@me`

### GET

Returns the authenticated user

### PATCH

Edit the authenticated. `super` accounts are **not** allowed to edit their user.
Use the server config.

The only fields allowed are:

- `username`

```json
{
	"username": "new-username-here"
}
```

### DELETE

Delete the authenticated user.
