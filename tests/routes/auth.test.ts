import { assert, assertEquals, FakeTime, superoak } from "../deps.ts";
import { Status } from "../../deps.ts";
import { app } from "../../main.ts";
import { config } from "../../src/config.ts";
import {
	email,
	email2,
	password,
	password2,
	username,
	username2,
} from "../config.ts";
import type { User } from "../../src/models/mod.ts";

Deno.test({
	name: "http-local-user",
	async fn(t) {
		let user: User;
		const registerSuccess = await t.step({
			name: "register",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/register").set(
					"content-type",
					"application/json",
				)
					.send(JSON.stringify({
						username,
						password,
						email,
					})).expect(Status.NoContent);

				const request2 = await superoak(app);
				await request2.post("/api/auth/register").set(
					"content-type",
					"application/json",
				)
					.send(JSON.stringify({
						username: username2,
						password: password2,
						email: email2,
					})).expect(Status.NoContent);
			},
		});
		assert(registerSuccess);

		const loginBasicSuccess = await t.step({
			name: "login-basic",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					await request.get("/api/auth/token").set(
						"authorization",
						`Basic ${btoa(`${email}:${password}`)}`,
					).expect(Status.OK).expect("Content-Type", "application/json");

					time.tick(120 * 60 * 1000); // 120min
				} finally {
					time.restore();
				}
			},
		});
		assert(loginBasicSuccess);

		const registerDuplicateUsername = await t.step({
			name: "register-duplicate-username",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/register").set(
					"content-type",
					"application/json",
				)
					.send(JSON.stringify({
						username,
						password,
						email,
					})).expect(Status.BadRequest);
			},
		});
		assert(registerDuplicateUsername);

		const loginBearerSuccess = await t.step({
			name: "login-bearer",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					const request2 = await superoak(app);
					const tokenResponse = await request.get("/api/auth/token").set(
						"authorization",
						`Basic ${btoa(`${email}:${password}`)}`,
					).expect(Status.OK).expect("Content-Type", "application/json");

					const userMeResponse = await request2.get("/api/users/@me").set(
						"authorization",
						`Bearer ${tokenResponse.body.token}`,
					).expect(Status.OK).expect("Content-Type", "application/json");

					user = userMeResponse.body;

					assertEquals(user.email, email);
					assertEquals(user.username, username);
					assert("id" in user);
					assert(typeof user.id === "string");

					time.tick(120 * 60 * 1000); // 120min
					const tokenExpiredRequest = await superoak(app);

					await tokenExpiredRequest.get("/api/users/@me").set(
						"authorization",
						`Bearer ${tokenResponse.body.token}`,
					).expect(Status.Forbidden).expect("Content-Type", "application/json");
				} catch (err) {
					throw err;
				} finally {
					time.restore();
				}
			},
		});
		assert(loginBearerSuccess);

		const tokenRevoke = await t.step({
			name: "token-revoke",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					const tokenResponse = await request.get("/api/auth/token?exp=500")
						.set(
							"authorization",
							`Basic ${btoa(`${email}:${password}`)}`,
						).expect(Status.OK).expect("Content-Type", "application/json");
					const revokeTokenRequest = await superoak(app);
					await revokeTokenRequest.post("/api/auth/token/revoke").set(
						"authorization",
						`Basic ${btoa(`${email}:${password}`)}`,
					).send({
						token: tokenResponse.body.token,
					}).expect(Status.NoContent);
					time.tick(500);
				} finally {
					time.restore();
				}
			},
		});
		assert(tokenRevoke);

		const tokenRevokeByAdmin = await t.step({
			name: "token-revoke-by-admin",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					const tokenResponse = await request.get("/api/auth/token?exp=500")
						.set(
							"authorization",
							`Basic ${btoa(`${email}:${password}`)}`,
						).expect(Status.OK).expect("Content-Type", "application/json");
					const revokeTokenRequest = await superoak(app);
					await revokeTokenRequest.post("/api/auth/token/revoke").set(
						"authorization",
						`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
					).send({
						token: tokenResponse.body.token,
					}).expect(Status.NoContent);
					time.tick(500);
				} finally {
					time.restore();
				}
			},
		});
		assert(tokenRevokeByAdmin);

		const revokeBadBody = await t.step({
			name: "revoke-bad-body",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/token/revoke").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "multipart/form-data").send(new URLSearchParams({
					test: "boop",
				}).toString()).expect(Status.BadRequest).expect(
					"Content-Type",
					"application/json",
				);
			},
		});
		assert(revokeBadBody);

		const revokeNoToken = await t.step({
			name: "revoke-no-token",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/token/revoke").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					test: "boop",
				})).expect(Status.BadRequest).expect(
					"Content-Type",
					"application/json",
				);
			},
		});
		assert(revokeNoToken);

		const revokeBadToken = await t.step({
			name: "revoke-bad-token",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/token/revoke").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					token: "badtokenhere",
				})).expect(Status.NotFound).expect(
					"Content-Type",
					"application/json",
				);
			},
		});
		assert(revokeBadToken);

		const patchName = await t.step({
			name: "patch-name",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username: "TestyTest",
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				const request2 = await superoak(app);
				const responseMe = await request2.get("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe.body.username, "TestyTest");
				const request3 = await superoak(app);
				const responseMe2 = await request3.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username,
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe2.body.username, username);
			},
		});
		assert(patchName);

		const patchRole = await t.step({
			name: "patch-role",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					role: "admin",
				})).expect(Status.Forbidden).expect(
					"Content-Type",
					"application/json",
				);
			},
		});
		assert(patchRole);

		const patchNameById = await t.step({
			name: "patch-name-by-id",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username: "TestyTest",
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				const request2 = await superoak(app);
				const responseMe = await request2.get(`/api/users/${user.id}`).expect(
					Status.OK,
				).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe.body.username, "TestyTest");
				const request3 = await superoak(app);
				const responseMe2 = await request3.patch(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username,
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe2.body.username, username);
			},
		});
		assert(patchNameById);

		const patchNameByIdAsSuper = await t.step({
			name: "patch-name-by-id",
			async fn() {
				const request = await superoak(app);
				await request.patch(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username: "TestyTest",
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				const request2 = await superoak(app);
				const responseMe = await request2.get(`/api/users/${user.id}`).expect(
					Status.OK,
				).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe.body.username, "TestyTest");
				const request3 = await superoak(app);
				const responseMe2 = await request3.patch(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username,
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe2.body.username, username);
			},
		});
		assert(patchNameByIdAsSuper);

		const patchRoleByIdAsSuper = await t.step({
			name: "patch-role-by-id",
			async fn() {
				const request = await superoak(app);
				await request.patch(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					role: "admin",
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				const request2 = await superoak(app);
				const responseMe = await request2.get(`/api/users/${user.id}`).expect(
					Status.OK,
				).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe.body.role, "admin");
				const request3 = await superoak(app);
				const responseMe2 = await request3.patch(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					role: user.role,
				})).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe2.body.role, user.role);
			},
		});
		assert(patchRoleByIdAsSuper);

		const patchDuplicateName = await t.step({
			name: "patch-duplicate-name",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email2}:${password2}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username,
				})).expect(Status.BadRequest).expect(
					"Content-Type",
					"application/json",
				);
				const request2 = await superoak(app);
				const responseMe = await request2.get("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email2}:${password2}`)}`,
				).expect(Status.OK).expect(
					"Content-Type",
					"application/json",
				);
				assertEquals(responseMe.body.username, username2);
			},
		});
		assert(patchDuplicateName);

		const patchBadBody = await t.step({
			name: "patch-bad-body",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "multipart/form-data").send(new URLSearchParams({
					username: "beep",
				}).toString()).expect(Status.BadRequest);
			},
		});
		assert(patchBadBody);

		const patchForbidden = await t.step({
			name: "patch-forbidden",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/1").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).set("Content-Type", "application/json").send(
					JSON.stringify({
						username: "beep",
					}).toString(),
				).expect(Status.Forbidden);
			},
		});
		assert(patchForbidden);

		const getUserById = await t.step({
			name: "user-by-id",
			async fn() {
				const request = await superoak(app);

				const response = await request.get(`/api/users/${user.id}`)
					.expect(Status.OK)
					.expect("Content-Type", "application/json");

				const body: User = response.body;

				assert(body.username === username);
				assert(body.id === user.id);
				assert(body.email === undefined);
			},
		});
		assert(getUserById);

		const getUserByIdAuthenticated = await t.step({
			name: "user-by-id",
			async fn() {
				const request = await superoak(app);

				const response = await request.get(`/api/users/${user.id}`).set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				)
					.expect(Status.OK)
					.expect("Content-Type", "application/json");

				const body: User = response.body;

				assert(body.username === username);
				assert(body.id === user.id);
				assert(body.email === email);
			},
		});
		assert(getUserByIdAuthenticated);

		const getUsers = await t.step({
			name: "users",
			async fn() {
				const request = await superoak(app);

				const response = await request.get(
					`/api/users?username=${username}&limit=201`,
				)
					.expect(Status.OK)
					.expect("Content-Type", "application/json");

				const body = response.body as { username: string; id: number }[];
				const userFromBody = body.find((a) =>
					a.username === user.username && a.id === user.id
				);
				assert(userFromBody);
				// @ts-ignore Ideally there really wouldn't be any email
				assert(userFromBody.email === undefined);
			},
		});
		assert(getUsers);

		const wrongPassword = await t.step({
			name: "wrong-password",
			async fn() {
				const request = await superoak(app);

				await request.get("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:testytest`)}`,
				)
					.expect(Status.Unauthorized).expect(
						"Content-Type",
						"application/json",
					);
			},
		});
		assert(wrongPassword);

		const wrongEmail = await t.step({
			name: "wrong-email",
			async fn() {
				const request = await superoak(app);

				await request.get("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`test@localhost.com:${password}`)}`,
				)
					.expect(Status.Unauthorized).expect(
						"Content-Type",
						"application/json",
					);
			},
		});
		assert(wrongEmail);

		const deleteSuccess = await t.step({
			name: "delete",
			async fn() {
				const request = await superoak(app);
				await request.delete("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).expect(Status.NoContent);

				const request2 = await superoak(app);
				await request2.delete("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email2}:${password2}`)}`,
				).expect(Status.NoContent);
			},
		});
		assert(deleteSuccess);
	},
});

Deno.test({
	name: "unauthenticated",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").expect(Status.Unauthorized).expect(
			"Content-Type",
			"application/json",
		);
	},
});

Deno.test({
	name: "unauthenticated-revoke",
	async fn() {
		const request = await superoak(app);

		await request.post("/api/auth/token/revoke").expect(Status.Unauthorized)
			.expect(
				"Content-Type",
				"application/json",
			);
	},
});

Deno.test({
	name: "unauthenticated-token",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/auth/token").expect(Status.Unauthorized).expect(
			"Content-Type",
			"application/json",
		);
	},
});

Deno.test({
	name: "register-bad-body",
	async fn() {
		const request = await superoak(app);
		await request.post("/api/auth/register").set(
			"content-type",
			"multipart/form-data",
		)
			.send(new URLSearchParams({
				username,
				password,
			}).toString()).expect(Status.BadRequest);
	},
});

Deno.test({
	name: "register-no-email",
	async fn() {
		const request = await superoak(app);
		await request.post("/api/auth/register").set(
			"content-type",
			"application/json",
		)
			.send(JSON.stringify({
				username,
				password,
			})).expect(Status.BadRequest).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "register-get-not-found",
	async fn() {
		const request = await superoak(app);
		await request.get("/api/auth/register").expect(Status.NotFound).expect(
			"Content-Type",
			"application/json",
		);
	},
});

Deno.test({
	name: "revoke-get-not-found",
	async fn() {
		const request = await superoak(app);
		await request.get("/api/auth/token/revoke").expect(Status.NotFound).expect(
			"Content-Type",
			"application/json",
		);
	},
});

Deno.test({
	name: "revoke-unauthorized",
	async fn() {
		const request = await superoak(app);
		await request.post("/api/auth/token/revoke").expect(Status.Unauthorized)
			.expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-bearer-token",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set(
			"authorization",
			"Bearer helloworld",
		)
			.expect(Status.Forbidden).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-basic-value-2-spaces",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set(
			"authorization",
			"Basic hello world",
		)
			.expect(Status.Unauthorized).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-basic-0-colons",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set(
			"authorization",
			`Basic ${btoa("helloworld")}`,
		)
			.expect(Status.Unauthorized).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-basic-value-2-colons",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set(
			"authorization",
			`Basic ${btoa("hello:world:!")}`,
		)
			.expect(Status.Unauthorized).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-basic-value-bad-encoding",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set("authorization", "Basic ??")
			.expect(Status.Unauthorized).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "invalid-auth-method",
	async fn() {
		const request = await superoak(app);

		await request.get("/api/users/@me").set(
			"authorization",
			"Hacker beepboop",
		)
			.expect(Status.BadRequest).expect("Content-Type", "application/json");
	},
});

Deno.test({
	name: "patch-super",
	async fn() {
		const request = await superoak(app);
		await request.patch("/api/users/@me").set(
			"authorization",
			`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
		).expect(Status.Forbidden);
	},
});

Deno.test({
	name: "users-super",
	async fn() {
		const request = await superoak(app);
		const response = await request.get("/api/users").set(
			"authorization",
			`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
		).expect(Status.OK);
		(response.body as User[]).forEach((user) => assert(user.email));
	},
});

Deno.test({
	name: "user-by-id-super",
	async fn() {
		const request = await superoak(app);
		// Might as well hard code user `1` here since it's probably the admin
		const response = await request.get("/api/users/1").set(
			"authorization",
			`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
		).expect(Status.OK);
		assert((response.body as User).email);
	},
});

Deno.test({
	name: "patch-unauthorized",
	async fn() {
		const request = await superoak(app);
		await request.patch("/api/users/1").set("Content-Type", "application/json")
			.send(
				JSON.stringify({
					username: "beep",
				}).toString(),
			).expect(Status.Unauthorized);
	},
});

Deno.test({
	name: "patch-super-forbidden",
	async fn() {
		const request = await superoak(app);
		await request.patch("/api/users/1").set(
			"authorization",
			`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
		).set("Content-Type", "application/json").send(
			JSON.stringify({
				username: "beep",
			}).toString(),
		).expect(Status.Forbidden);
	},
});

Deno.test({
	name: "get-by-id-not-found",
	async fn() {
		const request = await superoak(app);
		await request.get(`/api/users/${Math.round(Math.random() * 10000000)}`)
			.expect(Status.NotFound);
	},
});

Deno.test({
	name: "patch-by-id-not-found",
	async fn() {
		const request = await superoak(app);
		await request.patch(`/api/users/${Math.round(Math.random() * 10000000)}`)
			.set(
				"authorization",
				`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
			).expect(Status.NotFound);
	},
});
