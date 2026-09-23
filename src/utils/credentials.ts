import type { Credentials } from "../types";

const STORAGE_KEY = "green-api-credentials";

export function loadCredentials(): Credentials | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Credentials;
		if (!parsed.idInstance || !parsed.apiTokenInstance) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function saveCredentials(credentials: Credentials): void {
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCredentials(): void {
	sessionStorage.removeItem(STORAGE_KEY);
}
