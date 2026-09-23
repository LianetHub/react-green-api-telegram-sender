export type ChatMessage = {
	id: string;
	chatId: string;
	text: string;
	direction: "incoming" | "outgoing";
	timestamp: number;
};

export type Chat = {
	chatId: string;
	phone: string;
	title: string;
	/** Alternate ids (phone@c.us, telegram user id) for matching incoming webhooks */
	aliases: string[];
};
