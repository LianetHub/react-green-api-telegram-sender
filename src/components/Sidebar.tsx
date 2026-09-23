import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Chat } from "../types";

type Props = {
	chats: Chat[];
	activeChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onCreateChat: (rawInput: string) => Promise<void>;
	creating?: boolean;
	onLogout: () => void;
};

export function Sidebar({
	chats,
	activeChatId,
	onSelectChat,
	onCreateChat,
	creating,
	onLogout,
}: Props) {
	const [phone, setPhone] = useState("");
	const [error, setError] = useState("");

	const handleCreate = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		try {
			await onCreateChat(phone);
			setPhone("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Не удалось создать чат");
		}
	};

	return (
		<aside className="sidebar">
			<header className="sidebar-header">
				<div>
					<h1>Мои Чаты</h1>
					<p className="sidebar-hint">Отправка в Telegram GREEN-API</p>
				</div>
				<button type="button" className="btn ghost" onClick={onLogout}>
					Выйти
				</button>
			</header>

			<form className="new-chat" onSubmit={(e) => void handleCreate(e)}>
				<input
					type="tel"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="Телефон или Telegram ID"
					aria-label="Телефон или Telegram ID"
					disabled={creating}
				/>
				<button
					type="submit"
					className="btn primary compact"
					disabled={creating || !phone.trim()}>
					{creating ? "…" : "Создать"}
				</button>
			</form>
			{error ? <p className="form-error sidebar-error">{error}</p> : null}

			<ul className="chat-list">
				{chats.length === 0 ? (
					<li className="chat-list-empty">Нет чатов — создайте новый</li>
				) : (
					chats.map((chat) => (
						<li key={chat.chatId}>
							<button
								type="button"
								className={
									chat.chatId === activeChatId
										? "chat-item active"
										: "chat-item"
								}
								onClick={() => onSelectChat(chat.chatId)}>
								<span className="chat-avatar" aria-hidden>
									{chat.title.slice(-2)}
								</span>
								<span className="chat-item-text">
									<span className="chat-item-title">{chat.title}</span>
									<span className="chat-item-id">{chat.chatId}</span>
								</span>
							</button>
						</li>
					))
				)}
			</ul>
		</aside>
	);
}
