export class GreenApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "GreenApiError";
		this.status = status;
	}
}

export function isGreenApiError(error: unknown): error is GreenApiError {
	return error instanceof GreenApiError;
}

export function isUnauthorized(error: unknown): boolean {
	return (
		isGreenApiError(error) && (error.status === 401 || error.status === 403)
	);
}
