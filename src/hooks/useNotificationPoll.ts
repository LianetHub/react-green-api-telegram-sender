import { useEffect, useRef } from "react";
import {
	deleteNotification,
	lastIncomingMessages,
	receiveNotification,
	setSettings,
} from "../api";
import type {
	ChatMessage,
	Credentials,
	IncomingWebhookBody,
	JournalIncomingMessage,
} from "../types";

const settingsReadyFor = new Set<string>();

async function ensureIncomingOnlySettings(
	credentials: Credentials,
): Promise<void> {
	const key = credentials.idInstance;
	if (settingsReadyFor.has(key)) {
		return;
	}
	settingsReadyFor.add(key);
	try {
		await setSettings(credentials);
	} catch {
		settingsReadyFor.delete(key);
	}
}

function extractText(body: IncomingWebhookBody): string | null {
	const data = body.messageData;
	if (!data) {
		return null;
	}

	const fromText = data.textMessageData?.textMessage?.trim();
	if (fromText) {
		return fromText;
	}

	const fromExtended = data.extendedTextMessageData?.text?.trim();
	if (fromExtended) {
		return fromExtended;
	}

	return null;
}

export type IncomingPayload = {
	message: ChatMessage;
	phone?: string;
	senderName?: string;
};

function toIncomingPayload(body: IncomingWebhookBody): IncomingPayload | null {
	if (!body || body.typeWebhook !== "incomingMessageReceived") {
		return null;
	}

	const rawChatId = body.senderData?.chatId ?? body.senderData?.sender;
	const chatId = rawChatId != null ? String(rawChatId) : "";
	const text = extractText(body);
	if (!chatId || !text) {
		return null;
	}

	const phoneRaw = body.senderData?.senderPhoneNumber;
	const phone = phoneRaw && phoneRaw > 0 ? String(phoneRaw) : undefined;

	return {
		message: {
			id: body.idMessage ?? `${chatId}-${body.timestamp ?? Date.now()}`,
			chatId,
			text,
			direction: "incoming",
			timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
		},
		phone,
		senderName: body.senderData?.senderName || body.senderData?.chatName,
	};
}

function toSeconds(timestamp?: number): number {
	if (!timestamp) {
		return Math.floor(Date.now() / 1000);
	}
	return timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp;
}

function toIncomingFromJournal(
	item: JournalIncomingMessage,
): IncomingPayload | null {
	const rawChatId = item.chatId ?? item.senderId;
	const chatId = rawChatId != null ? String(rawChatId) : "";
	const text =
		item.textMessage?.trim() ||
		item.extendedTextMessageData?.text?.trim() ||
		null;
	if (!chatId || !text) {
		return null;
	}

	const phoneRaw = item.senderPhoneNumber;
	const phone = phoneRaw && phoneRaw > 0 ? String(phoneRaw) : undefined;
	const timestampSec = toSeconds(item.timestamp);

	return {
		message: {
			id: item.idMessage ?? `${chatId}-${timestampSec}`,
			chatId,
			text,
			direction: "incoming",
			timestamp: timestampSec * 1000,
		},
		phone,
		senderName: item.senderName || item.senderContactName,
	};
}

type Options = {
	credentials: Credentials | null;
	onMessage: (payload: IncomingPayload) => void;
	onError?: (error: Error) => void;
	onPollOk?: () => void;
};

export function useNotificationPoll({
	credentials,
	onMessage,
	onError,
	onPollOk,
}: Options): void {
	const callbacksRef = useRef({ onMessage, onError, onPollOk });

	useEffect(() => {
		callbacksRef.current = { onMessage, onError, onPollOk };
	}, [onMessage, onError, onPollOk]);

	useEffect(() => {
		if (!credentials) {
			return;
		}

		const controller = new AbortController();
		let active = true;

		void ensureIncomingOnlySettings(credentials);

		const loop = async () => {
			while (active) {
				try {
					const notification = await receiveNotification(
						credentials,
						5,
						controller.signal,
					);

					if (!active) {
						break;
					}

					callbacksRef.current.onPollOk?.();

					if (!notification) {
						continue;
					}

					try {
						const payload = toIncomingPayload(notification.body);
						if (payload) {
							callbacksRef.current.onMessage(payload);
						}
					} catch (error) {
						callbacksRef.current.onError?.(
							error instanceof Error ? error : new Error(String(error)),
						);
					}

					await deleteNotification(
						credentials,
						notification.receiptId,
						controller.signal,
					);
				} catch (error) {
					if (!active || controller.signal.aborted) {
						break;
					}

					if (error instanceof DOMException && error.name === "AbortError") {
						break;
					}

					callbacksRef.current.onError?.(
						error instanceof Error ? error : new Error(String(error)),
					);

					await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			}
		};

		const journalSinceSec = Math.floor(Date.now() / 1000);
		const journalLoop = async () => {
			while (active) {
				try {
					const items = await lastIncomingMessages(
						credentials,
						2,
						controller.signal,
					);
					if (!active) {
						break;
					}

					for (const item of items) {
						const payload = toIncomingFromJournal(item);
						if (!payload) {
							continue;
						}
						if (
							Math.floor(payload.message.timestamp / 1000) < journalSinceSec
						) {
							continue;
						}
						callbacksRef.current.onMessage(payload);
					}
				} catch (error) {
					if (!active || controller.signal.aborted) {
						break;
					}

					if (error instanceof DOMException && error.name === "AbortError") {
						break;
					}
				}

				await new Promise((resolve) => setTimeout(resolve, 4000));
			}
		};

		void loop();
		void journalLoop();

		return () => {
			active = false;
			controller.abort();
		};
	}, [credentials]);
}
