import { assert, delay, type SuperDeno, superoak } from "../deps.ts";
import { app } from "../../src/mod.ts";
import { email, password, username } from "../config.ts";

Deno.test({
	name: "http-new-local-user",
	async fn(t) {
		let request: SuperDeno;
		const registerSuccess = await t.step({
			name: "register",
			async fn() {
				request = await superoak(app);
				await request.post("/api/auth/register").set(
					"content-type",
					"application/json",
				)
					.send(JSON.stringify({
						username,
						password,
						email,
					})).expect(204);
			},
		});

		assert(registerSuccess);

		const loginSuccess = await t.step({
			name: "login",
			async fn() {
				request = await superoak(app);
				await request.get("/api/auth/token?exp=500").set(
					"authorization",
					`Basic ${btoa(`${email}:${password}`)}`,
				).expect(200);
			},
		});

		assert(loginSuccess);
	},
});
