import "../../src/models/database.ts";
import { Token, User, UserLocal } from "../../src/models/mod.ts";
import { generateSalt, hashPassword } from "../../src/utils/auth.ts";
import { assertEquals } from "../deps.ts";
import { email, password, username } from "../config.ts";

Deno.test({
	name: "orm-new-local-user-and-token",
	async fn() {
		// Constants
		const salt = generateSalt();

		// Make a user before saving them to the users_local table
		await User.create({
			username,
			email,
			role: "user",
			id: 999,
		});

		// Usernames are public, emails are not
		// So use emails for auth
		const user = await User.where("email", "=", email).first() as User;

		await UserLocal.create({
			salt,
			hash: await hashPassword(password, salt),
			userId: user.id,
			id: 999,
		});

		const userLocal = await UserLocal.where("userId", "=", user.id)
			.first() as UserLocal;

		assertEquals(await UserLocal.where("id", userLocal.id).user(), user);
		assertEquals(userLocal.hash, await hashPassword(password, userLocal.salt));

		const token = crypto.randomUUID();

		await Token.create({
			userId: user.id,
			scope: "read",
			token,
			exp: 500,
		});
		const tokenObj = await Token.where("userId", user.id).first() as Token;
		assertEquals(await Token.where("id", tokenObj.id).user(), user);

		// Clean up
		await user.delete();
		await userLocal.delete();
		await tokenObj.delete();
	},
});
