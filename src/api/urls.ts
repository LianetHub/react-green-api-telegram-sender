import type { Credentials } from "../types";

export function hostPrefix(idInstance: string): string {
	return idInstance.slice(0, 4);
}

export function buildUrl(
	credentials: Credentials,
	methodPath: string,
	query?: Record<string, string | number>,
	extraPath?: string,
): string {
	const prefix = hostPrefix(credentials.idInstance);
	let path = `/green-api/${prefix}/waInstance${credentials.idInstance}/${methodPath}/${credentials.apiTokenInstance}`;

	if (extraPath) {
		path += extraPath.startsWith("/") ? extraPath : `/${extraPath}`;
	}

	if (!query) {
		return path;
	}

	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		params.set(key, String(value));
	}
	return `${path}?${params.toString()}`;
}
