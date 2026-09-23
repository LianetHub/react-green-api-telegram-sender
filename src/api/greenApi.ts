import type {
	CheckAccountResult,
	Credentials,
	InstanceState,
	JournalIncomingMessage,
	NotificationPayload,
	SendMessageResult,
} from "../types";
import { http } from "./client";
import { buildUrl } from "./urls";

const INCOMING_ONLY_SETTINGS = {
	webhookUrl: "",
	incomingWebhook: "yes",
	outgoingWebhook: "no",
	outgoingMessageWebhook: "no",
	outgoingAPIMessageWebhook: "no",
	stateWebhook: "no",
} as const;

function parseNullableJson(raw: unknown): NotificationPayload | null {
	if (raw == null || raw === "" || raw === "null") {
		return null;
	}

	if (typeof raw === "object") {
		return raw as NotificationPayload;
	}

	if (typeof raw !== "string") {
		return null;
	}

	const trimmed = raw.trim();
	if (!trimmed || trimmed === "null") {
		return null;
	}

	return JSON.parse(trimmed) as NotificationPayload;
}

export function getStateInstance(credentials: Credentials) {
	return http
		.get<InstanceState>(buildUrl(credentials, "getStateInstance"))
		.then((response) => response.data);
}

export function setSettings(credentials: Credentials) {
	return http
		.post(buildUrl(credentials, "setSettings"), INCOMING_ONLY_SETTINGS)
		.then(() => undefined);
}

export function sendMessage(
	credentials: Credentials,
	chatId: string,
	message: string,
) {
	return http
		.post<SendMessageResult>(buildUrl(credentials, "sendMessage"), {
			chatId,
			message,
		})
		.then((response) => response.data);
}

export function receiveNotification(
	credentials: Credentials,
	receiveTimeout = 5,
	signal?: AbortSignal,
) {
	return http
		.get<NotificationPayload | null>(
			buildUrl(credentials, "receiveNotification", { receiveTimeout }),
			{
				signal,
				transformResponse: [parseNullableJson],
			},
		)
		.then((response) => response.data);
}

export function deleteNotification(
	credentials: Credentials,
	receiptId: number,
	signal?: AbortSignal,
) {
	return http
		.delete(
			buildUrl(credentials, "deleteNotification", undefined, String(receiptId)),
			{
				signal,
			},
		)
		.then(() => undefined);
}

export function checkAccount(credentials: Credentials, phoneNumber: string) {
	return http
		.post<CheckAccountResult>(buildUrl(credentials, "checkAccount"), {
			phoneNumber: Number(phoneNumber),
		})
		.then((response) => response.data);
}

export function lastIncomingMessages(
	credentials: Credentials,
	minutes = 2,
	signal?: AbortSignal,
) {
	return http
		.get<JournalIncomingMessage[]>(
			buildUrl(credentials, "lastIncomingMessages", { minutes }),
			{ signal },
		)
		.then((response) => (Array.isArray(response.data) ? response.data : []));
}
