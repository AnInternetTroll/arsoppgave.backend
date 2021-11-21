export function success({
	status = 200,
	message = undefined,
}: {
	status: number;
	message?: string;
}) {
	JSON.stringify({
		status,
		message,
	});
}
