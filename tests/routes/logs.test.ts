import { assert, superoak } from "../deps.ts";
import { log, Status } from "../../deps.ts";
import { app } from "../../main.ts";
import { config } from "../../src/config.ts";
import type { Log } from "../../src/models/mod.ts";

Deno.test({
	name: "logs-super",
	async fn() {
		log.critical("This is a test!");
		const req = await superoak(app);
		const response = await req.get("/api/logs?level=50&limit=20").set(
			"authorization",
			`Basic ${btoa(`${config.adminEmail}:${config.adminPassword}`)}`,
		).expect(200).expect("content-type", "application/json");
		const logs: Log[] = response.body;
		const singleLog = logs.find((log) =>
			log.message.includes("This is a test!")
		);
		assert(singleLog);
		assert(singleLog.id);
		assert(singleLog.message);
		assert(typeof singleLog.message === "string");
		assert(singleLog.level === "50");
	},
});

Deno.test({
	name: "logs-unrestricted",
	async fn() {
		const req = await superoak(app);
		await req.get("/api/logs").expect(Status.Unauthorized).expect(
			"content-type",
			"application/json",
		);
	},
});
