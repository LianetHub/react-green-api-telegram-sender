import type { Chat } from "../types";

function digitsOf(value: string): string {
	return value.replace(/\D/g, "");
}

export function chatMatches(
	chat: Chat,
	chatId: string,
	phone?: string,
): boolean {
	if (chat.chatId === chatId) return true;
	if (chat.aliases.includes(chatId)) return true;

	const incomingDigits = digitsOf(chatId);
	if (incomingDigits) {
		if (chat.phone === incomingDigits) return true;
		if (chat.aliases.includes(incomingDigits)) return true;
		if (chat.aliases.includes(`${incomingDigits}@c.us`)) return true;
		if (chat.chatId === `${incomingDigits}@c.us`) return true;
		if (digitsOf(chat.chatId) === incomingDigits) return true;
	}

	if (phone) {
		if (chat.phone === phone) return true;
		if (chat.aliases.includes(phone)) return true;
		if (chat.aliases.includes(`${phone}@c.us`)) return true;
		if (chat.chatId === `${phone}@c.us`) return true;
		if (digitsOf(chat.chatId) === phone) return true;
	}
	return false;
}
