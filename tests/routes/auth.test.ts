import { assert, assertEquals, FakeTime, superoak } from "../deps.ts";
import { Status } from "../../src/deps.ts";
import { app } from "../../src/mod.ts";
import { config } from "../../src/config.ts";
import {
	email,
	email2,
	password,
	password2,
	username,
	username2,
} from "../config.ts";

Deno.test({
	name: "http-local-user",
	async fn(t) {
		let user: {
			username: string;
			id: number;
		};
		let user2: {
			username: string;
			id: number;
		};

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
			},
		});
		assert(registerSuccess);

		const registerSuccess2 = await t.step({
			name: "register2",
			async fn() {
				const request = await superoak(app);
				await request.post("/api/auth/register").set(
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
		assert(registerSuccess2);

		const loginBasicSuccess = await t.step({
			name: "login-basic",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					await request.get("/api/auth/token").set(
						"authorization",
						`Basic ${btoa(`${email2}:${password2}`)}`,
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

					assertEquals(user.username, username);
					// @ts-ignore yes typescript, the whole point is to check it doesn't exist
					// what a diva
					assertEquals(user.email, undefined);
					assert("id" in user);
					assert(typeof user.id === "number");

					time.tick(120 * 60 * 1000); // 120min
					const tokenExpiredRequest = await superoak(app);

					await tokenExpiredRequest.get("/api/users/@me").set(
						"authorization",
						`Bearer ${tokenResponse.body.token}`,
					).expect(Status.Forbidden).expect("Content-Type", "application/json");
				} finally {
					time.restore();
				}
			},
		});
		assert(loginBearerSuccess);

		const getUser2 = await t.step({
			name: "get-user-2",
			async fn() {
				const request = await superoak(app);
				const response = await request.get("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email2}:${password2}`)}`,
				).expect(Status.OK).expect("Content-Type", "application/json");
				user2 = response.body;

				assertEquals(user2.username, username2);
			},
		});
		assert(getUser2);

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

		const tokenRevokeForbidden = await t.step({
			name: "token-revoke-forbidden",
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
						`Basic ${btoa(`${email2}:${password2}`)}`,
					).send({
						token: tokenResponse.body.token,
					}).expect(Status.NotFound);
					time.tick(500);
				} finally {
					time.restore();
				}
			},
		});
		assert(tokenRevokeForbidden);

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

		const patchNameDuplicate = await t.step({
			name: "patch-name-duplicate",
			async fn() {
				const request = await superoak(app);
				await request.patch("/api/users/@me").set(
					"authorization",
					`Basic ${btoa(`${email2}:${password2}`)}`,
				).set("Content-Type", "application/json").send(JSON.stringify({
					username,
				})).expect(Status.BadRequest);
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
		assert(patchNameDuplicate);

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

		const getUserById = await t.step({
			name: "user-by-id",
			async fn() {
				const request = await superoak(app);

				const response = await request.get(`/api/users/${user.id}`)
					.expect(Status.OK)
					.expect("Content-Type", "application/json");

				const { body } = response;

				assert(body.username === username);
				assert(body.id === user.id);
			},
		});
		assert(getUserById);

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
			},
		});
		assert(deleteSuccess);

		const deleteSuccess2 = await t.step({
			name: "delete-2",
			async fn() {
				const request = await superoak(app);
				await request.delete("/api/users/@me").set(
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

		await request.get("/api/users/@me").set("authorization", "Basic ø")
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
