import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chat, ChatMessage } from "../types";
import { chatMatches } from "../utils/chatMatch";
import { loadChatSession, saveChatSession } from "../utils/chatSession";
import type { IncomingPayload } from "./useNotificationPoll";

const EMPTY_MESSAGES: ChatMessage[] = [];

function readChatSession(idInstance: string) {
	return (
		loadChatSession(idInstance) ?? {
			idInstance,
			chats: [] as Chat[],
			activeChatId: null as string | null,
			messagesByChat: {} as Record<string, ChatMessage[]>,
		}
	);
}

export function useChatSession(idInstance: string) {
	const [initial] = useState(() => readChatSession(idInstance));
	const [chats, setChats] = useState<Chat[]>(initial.chats);
	const [activeChatId, setActiveChatId] = useState<string | null>(
		initial.activeChatId,
	);
	const [messagesByChat, setMessagesByChat] = useState<
		Record<string, ChatMessage[]>
	>(initial.messagesByChat);

	const chatsRef = useRef(chats);
	const messagesRef = useRef(messagesByChat);

	useEffect(() => {
		chatsRef.current = chats;
	}, [chats]);
	useEffect(() => {
		messagesRef.current = messagesByChat;
	}, [messagesByChat]);

	useEffect(() => {
		saveChatSession({
			idInstance,
			chats,
			activeChatId,
			messagesByChat,
		});
	}, [idInstance, chats, activeChatId, messagesByChat]);

	const activeChat = useMemo(
		() => chats.find((chat) => chat.chatId === activeChatId) ?? null,
		[chats, activeChatId],
	);

	const activeMessages = activeChatId
		? (messagesByChat[activeChatId] ?? EMPTY_MESSAGES)
		: EMPTY_MESSAGES;

	const applyIncoming = useCallback((payload: IncomingPayload) => {
		const { message, phone, senderName } = payload;
		const existing = chatsRef.current.find((chat) =>
			chatMatches(chat, message.chatId, phone),
		);

		if (!existing) {
			return;
		}

		const existingMessages =
			messagesRef.current[existing.chatId] ?? EMPTY_MESSAGES;
		if (existingMessages.some((item) => item.id === message.id)) {
			return;
		}

		const aliases = new Set(existing.aliases);
		aliases.add(message.chatId);
		if (phone) {
			aliases.add(phone);
			aliases.add(`${phone}@c.us`);
		}

		const nextChats = chatsRef.current.map((chat) =>
			chat.chatId === existing.chatId
				? {
						...existing,
						phone: phone || existing.phone,
						title: existing.title || senderName || existing.chatId,
						aliases: [...aliases],
					}
				: chat,
		);
		const nextMsgs = {
			...messagesRef.current,
			[existing.chatId]: [
				...existingMessages,
				{ ...message, chatId: existing.chatId },
			],
		};

		chatsRef.current = nextChats;
		messagesRef.current = nextMsgs;

		setChats(nextChats);
		setMessagesByChat(nextMsgs);
	}, []);

	const addOrFocusChat = useCallback((chat: Chat) => {
		setChats((prev) => {
			const existing = prev.find((item) =>
				chatMatches(item, chat.chatId, chat.phone || undefined),
			);
			if (existing) {
				setActiveChatId(existing.chatId);
				return prev;
			}
			return [chat, ...prev];
		});
		setActiveChatId(chat.chatId);
	}, []);

	const appendMessage = useCallback((chatId: string, message: ChatMessage) => {
		setMessagesByChat((prev) => ({
			...prev,
			[chatId]: [...(prev[chatId] ?? []), message],
		}));
	}, []);

	return {
		chats,
		activeChatId,
		setActiveChatId,
		activeChat,
		activeMessages,
		applyIncoming,
		addOrFocusChat,
		appendMessage,
	};
}
