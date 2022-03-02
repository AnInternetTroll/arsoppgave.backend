import { Context, encodeBase64, encodeHex, log, Status } from "../../deps.ts";
import { User } from "../models/user.ts";

export async function hashPassword(
	password: string,
	salt?: string,
): Promise<string> {
	const data = new TextEncoder()
		.encode(
			password + (
				salt ? `:${salt}` : ""
			),
		);
	const buffer = await crypto.subtle.digest("SHA-256", data);
	return (new TextDecoder()).decode(encodeHex(new Uint8Array(buffer)));
}

export function generateSalt(): string {
	const salt = new Uint8Array(16);
	crypto.getRandomValues(salt);
	return encodeBase64(salt);
}

export async function patchUser(
	ctx: Context,
	user: User,
	authorizedUser: User,
) {
	if (user.role === "super") {
		return ctx.throw(
			Status.Forbidden,
			"Superes may only be changed with the config file.",
		);
	}

	const bodyObj = ctx.request.body();

	if (bodyObj.type !== "json") {
		ctx.throw(Status.BadRequest, "Only JSON allowed");
	}

	const body = await bodyObj.value;

	user.username = body?.username || user.username;

	if (body.role) {
		if (authorizedUser.role !== "super") {
			ctx.throw(
				Status.Forbidden,
				"Only super accounts are allowed to edit a user's role.",
			);
		} else if (body.role === "super") {
			ctx.throw(Status.Forbidden, "No super accounts are allowed to be added.");
		} else user.role = body?.role || user.role;
	}

	let newUser: User;
	try {
		newUser = await user.update();
	} catch (err) {
		log.debug(err);
		return ctx.throw(Status.BadRequest, err);
	}

	ctx.response.headers.set("content-type", "application/json");
	ctx.response.body = JSON.stringify(newUser);
}
