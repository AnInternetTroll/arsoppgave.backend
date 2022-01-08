import { assert, assertEquals, FakeTime, superoak } from "../deps.ts";
import { Status } from "../../src/deps.ts";
import { app } from "../../src/mod.ts";
import { email, password, username } from "../config.ts";

Deno.test({
	name: "http-local-user",
	async fn(t) {
		let user: {
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
				} finally {
					time.restore();
				}
			},
		});
		assert(loginBearerSuccess);

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
