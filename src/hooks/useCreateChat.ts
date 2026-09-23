import { useCallback, useState } from "react";
import { checkAccount } from "../api";
import type { Chat, Credentials } from "../types";
import {
	formatPhoneTitle,
	isValidPhone,
	normalizePhone,
	phoneToChatId,
} from "../utils/phone";

type Options = {
	credentials: Credentials;
	onChatReady: (chat: Chat) => void;
	onStart?: () => void;
};

export function useCreateChat({ credentials, onChatReady, onStart }: Options) {
	const [creating, setCreating] = useState(false);

	const handleCreateChat = useCallback(
		async (rawInput: string) => {
			if (!isValidPhone(rawInput)) {
				throw new Error("Введите телефон или Telegram ID");
			}

			setCreating(true);
			onStart?.();
			try {
				const chat = await resolveChat(credentials, rawInput);
				onChatReady(chat);
			} finally {
				setCreating(false);
			}
		},
		[credentials, onChatReady, onStart],
	);

	return { creating, handleCreateChat };
}

async function resolveChat(
	credentials: Credentials,
	rawInput: string,
): Promise<Chat> {
	const trimmed = rawInput.trim();
	const digits = normalizePhone(trimmed);
	const looksLikePhone =
		!trimmed.startsWith("-") &&
		!trimmed.includes("@") &&
		digits.length >= 10 &&
		digits.length <= 15;

	let chatId = phoneToChatId(trimmed);
	const aliases = new Set<string>([chatId]);
	const phone = looksLikePhone ? digits : "";
	let title = formatPhoneTitle(trimmed);

	if (looksLikePhone) {
		aliases.add(`${digits}@c.us`);
		aliases.add(digits);
		try {
			const account = await checkAccount(credentials, digits);
			if (account.exist && account.chatId) {
				chatId = String(account.chatId);
				aliases.add(chatId);
				title = account.username || formatPhoneTitle(digits);
			}
		} catch (error) {
			console.warn("checkAccount failed, using phone@c.us", error);
		}
	}

	return {
		chatId,
		phone,
		title,
		aliases: [...aliases],
	};
}
