import "../../src/models/database.ts";
import { User, UserLocal } from "../../src/models/mod.ts";
import { generateSalt, hashPassword } from "../../src/utils/auth.ts";
import { assertEquals } from "../deps.ts";

Deno.test({
	name: "orm-new-local-user",
	async fn() {
		// Constants
		// http://bash.org/?244321
		const username = "AzureDiamond";
		const password = "hunter2";
		const email = "support@localhost.com";

		const salt = generateSalt();

		// Make a user before saving them to the users_local table
		await User.create({
			username,
			email,
			role: "user",
		});

		// Usernames are public, emails are not
		// So use emails for auth
		const user = await User.where("email", "=", email).first() as User;

		await UserLocal.create({
			salt,
			hash: await hashPassword(password, salt),
			userId: user.id,
		});

		const userLocal = await UserLocal.where("userId", "=", user.id)
			.first() as UserLocal;

		assertEquals(userLocal.hash, await hashPassword(password, userLocal.salt));

		// Clean up
		await user.delete();
		await userLocal.delete();
	},
});
