import axios, { type AxiosError, type AxiosInstance } from "axios";
import { GreenApiError } from "./errors";

function messageFromAxios(error: AxiosError): string {
	const data = error.response?.data;

	if (typeof data === "string" && data.trim()) {
		return data;
	}

	if (data && typeof data === "object") {
		const payload = data as { message?: string; error?: string };
		if (payload.message || payload.error) {
			return payload.message || payload.error || error.message;
		}
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
