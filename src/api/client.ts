import axios, { type AxiosError, type AxiosInstance } from "axios";
import { GreenApiError } from "./errors";

function asErrorText(value: unknown): string | null {
	if (typeof value === "string" && value.trim()) {
		return value.trim();
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		const parts = value
			.map((item) => asErrorText(item))
			.filter((item): item is string => Boolean(item));
		return parts.length ? parts.join("; ") : null;
	}
	if (value && typeof value === "object") {
		const payload = value as {
			message?: unknown;
			error?: unknown;
			description?: unknown;
		};
		return (
			asErrorText(payload.message) ||
			asErrorText(payload.error) ||
			asErrorText(payload.description)
		);
	}
	return null;
}

function messageFromAxios(error: AxiosError): string {
	const status = error.response?.status;
	const fromBody = asErrorText(error.response?.data);

	if (fromBody) {
		return fromBody;
	}

	if (status === 404) {
		return "Инстанс не найден (404). Проверьте idInstance и apiURL.";
	}
	if (status === 401 || status === 403) {
		return "Неверные idInstance или apiTokenInstance";
	}
	if (!error.response) {
		return "Нет ответа от GREEN-API. Проверьте сеть или CORS.";
	}

	return error.message || "Ошибка запроса к GREEN-API";
}

export const http: AxiosInstance = axios.create({
	timeout: 70_000,
});

http.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
			return Promise.reject(error);
		}

		throw new GreenApiError(
			error.response?.status ?? 0,
			messageFromAxios(error),
		);
	},
);
