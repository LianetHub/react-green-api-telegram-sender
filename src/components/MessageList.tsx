import { memo, useEffect, useRef } from "react";
import type { ChatMessage } from "../types";

type Props = {
	messages: ChatMessage[];
};

function formatTime(timestamp: number): string {
	return new Date(timestamp).toLocaleTimeString("ru-RU", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

const MessageBubble = memo(function MessageBubble({
	message,
}: {
	message: ChatMessage;
}) {
	return (
		<div
			className={
				message.direction === "outgoing" ? "bubble outgoing" : "bubble incoming"
			}>
			<p className="bubble-text">{message.text}</p>
			<time className="bubble-time">{formatTime(message.timestamp)}</time>
		</div>
	);
});

export const MessageList = memo(function MessageList({ messages }: Props) {
	const endRef = useRef<HTMLDivElement>(null);
	const lastId = messages.at(-1)?.id;

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [lastId]);

	if (messages.length === 0) {
		return (
			<div className="message-list empty">
				<p>Нет сообщений. Напишите первое.</p>
			</div>
		);
	}

	return (
		<div className="message-list">
			{messages.map((message) => (
				<MessageBubble key={message.id} message={message} />
			))}
			<div ref={endRef} />
		</div>
	);
});
