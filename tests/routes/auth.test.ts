import { assert, FakeTime, superoak } from "../deps.ts";
import { Status } from "../../src/deps.ts";
import { app } from "../../src/mod.ts";
import { email, password, username } from "../config.ts";

Deno.test({
	name: "http-new-local-user",
	async fn(t) {
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
			name: "login",
			async fn() {
				const time = new FakeTime();
				try {
					const request = await superoak(app);
					await request.get("/api/auth/token").set(
						"authorization",
						`Basic ${btoa(`${email}:${password}`)}`,
					).expect(Status.OK);
					time.tick(120 * 60 * 1000); // 120min
				} finally {
					time.restore();
				}
			},
		});

		assert(loginBasicSuccess);

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
