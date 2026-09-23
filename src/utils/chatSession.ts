import type { Chat, ChatMessage } from "../types";

const STORAGE_KEY = "green-api-chat-session-v2";

export type ChatSessionState = {
	idInstance: string;
	chats: Chat[];
	activeChatId: string | null;
	messagesByChat: Record<string, ChatMessage[]>;
};

export function loadChatSession(idInstance: string): ChatSessionState | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as ChatSessionState;
		if (parsed.idInstance !== idInstance || !Array.isArray(parsed.chats)) {
			return null;
		}

		return {
			idInstance,
			chats: parsed.chats,
			activeChatId: parsed.activeChatId ?? null,
			messagesByChat:
				parsed.messagesByChat && typeof parsed.messagesByChat === "object"
					? parsed.messagesByChat
					: {},
		};
	} catch {
		return null;
	}
}

export function saveChatSession(state: ChatSessionState): void {
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
