import { useState } from "react";
import type { KeyboardEvent, SubmitEvent } from "react";

type Props = {
	disabled?: boolean;
	onSend: (text: string) => Promise<void>;
};

export function MessageInput({ disabled, onSend }: Props) {
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);

	const submit = async () => {
		const value = text.trim();
		if (!value || sending || disabled) return;

		setSending(true);
		try {
			await onSend(value);
			setText("");
		} catch {
			// error shown by parent
		} finally {
			setSending(false);
		}
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		void submit();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void submit();
		}
	};

	return (
		<form className="message-input" onSubmit={handleSubmit}>
			<textarea
				rows={1}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Введите сообщение"
				disabled={disabled || sending}
				aria-label="Текст сообщения"
			/>
			<button
				type="submit"
				className="btn primary"
				disabled={disabled || sending || !text.trim()}>
				{sending ? "…" : "Отправить"}
			</button>
		</form>
	);
}
