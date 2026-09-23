export type InstanceState = {
	stateInstance: string;
};

export type SendMessageResult = {
	idMessage: string;
};

export type CheckAccountResult = {
	exist: boolean;
	chatId: string;
	username?: string;
	phoneNumber?: number;
};

export type IncomingWebhookBody = {
	typeWebhook?: string;
	timestamp?: number;
	idMessage?: string;
	senderData?: {
		chatId?: string | number;
		sender?: string | number;
		senderName?: string;
		chatName?: string;
		senderPhoneNumber?: number;
	};
	messageData?: {
		typeMessage?: string;
		textMessageData?: {
			textMessage?: string;
		};
		extendedTextMessageData?: {
			text?: string;
		};
	};
};

export type NotificationPayload = {
	receiptId: number;
	body: IncomingWebhookBody;
};

export type JournalIncomingMessage = {
	type?: string;
	idMessage?: string;
	timestamp?: number;
	typeMessage?: string;
	chatId?: string | number;
	textMessage?: string;
	senderId?: string | number;
	senderName?: string;
	senderContactName?: string;
	senderPhoneNumber?: number;
	extendedTextMessageData?: {
		text?: string;
	};
};
