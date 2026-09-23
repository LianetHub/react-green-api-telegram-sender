import { useCallback, useState } from "react";
import { sendMessage } from "../api";
import type { ChatMessage, Credentials } from "../types";

type Options = {
	credentials: Credentials;
	activeChatId: string | null;
	onSent: (chatId: string, message: ChatMessage) => void;
};

export function useSendMessage({ credentials, activeChatId, onSent }: Options) {
	const [sendError, setSendError] = useState("");

	const clearSendError = useCallback(() => {
		setSendError("");
	}, []);

	const handleSend = useCallback(
		async (text: string) => {
			if (!activeChatId) return;

			setSendError("");
			try {
				const { idMessage } = await sendMessage(
					credentials,
					activeChatId,
					text,
				);

				onSent(activeChatId, {
					id: idMessage,
					chatId: activeChatId,
					text,
					direction: "outgoing",
					timestamp: Date.now(),
				});
			} catch (error) {
				setSendError(
					error instanceof Error ? error.message : "Не удалось отправить",
				);
				throw error;
			}
		},
		[activeChatId, credentials, onSent],
	);

	return { sendError, clearSendError, handleSend };
}
