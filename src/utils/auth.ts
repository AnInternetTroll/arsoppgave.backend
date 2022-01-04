import { encodeBase64, encodeHex } from "../deps.ts";

export async function hashPassword(
	password: string,
	salt?: string,
): Promise<string> {
	const data = (new TextEncoder()).encode(
		password + (salt ? `:${salt}` : ""),
	);
	const buffer = await crypto.subtle.digest("SHA-256", data);
	return (new TextDecoder()).decode(encodeHex(new Uint8Array(buffer)));
}

export function generateSalt(): string {
	const salt = new Uint8Array(16);
	crypto.getRandomValues(salt);
	return encodeBase64(salt);
}
