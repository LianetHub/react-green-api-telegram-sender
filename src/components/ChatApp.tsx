import { useChatNotifications } from "../hooks/useChatNotifications";
import { useChatSession } from "../hooks/useChatSession";
import { useCreateChat } from "../hooks/useCreateChat";
import { useSendMessage } from "../hooks/useSendMessage";
import type { Credentials } from "../types";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Sidebar } from "./Sidebar";

type Props = {
	credentials: Credentials;
	onLogout: () => void;
};

export function ChatApp({ credentials, onLogout }: Props) {
	const {
		chats,
		activeChatId,
		setActiveChatId,
		activeChat,
		activeMessages,
		applyIncoming,
		addOrFocusChat,
		appendMessage,
	} = useChatSession(credentials.idInstance);

	const { sendError, clearSendError, handleSend } = useSendMessage({
		credentials,
		activeChatId,
		onSent: appendMessage,
	});

	const { creating, handleCreateChat } = useCreateChat({
		credentials,
		onChatReady: addOrFocusChat,
		onStart: clearSendError,
	});

	const pollError = useChatNotifications({
		credentials,
		onMessage: applyIncoming,
	});

	return (
		<div className="chat-shell">
			<Sidebar
				chats={chats}
				activeChatId={activeChatId}
				onSelectChat={setActiveChatId}
				onCreateChat={handleCreateChat}
				creating={creating}
				onLogout={onLogout}
			/>

			<main className="chat-main">
				{activeChat ? (
					<>
						<header className="chat-header">
							<h2>{activeChat.title}</h2>
							<p>{activeChat.chatId}</p>
						</header>

						<MessageList messages={activeMessages} />

						{(sendError || pollError) && (
							<div className="chat-alerts">
								{sendError ? <p className="form-error">{sendError}</p> : null}
								{pollError ? (
									<p className="form-error">Ошибка приёма: {pollError}</p>
								) : null}
							</div>
						)}

						<MessageInput onSend={handleSend} />
					</>
				) : (
					<div className="chat-placeholder">
						<h2>Выберите или создайте чат</h2>
						<p>Введите телефон или Telegram ID слева, чтобы начать переписку</p>
					</div>
				)}
			</main>
		</div>
	);
}
