/**
 * Нормализация номера и сбор chatId для GREEN-API Telegram.
 * По телефону: `79876543210@c.us`
 * Также принимаются готовый chatId, Telegram user id и id группы (`-100…`).
 */

export function normalizePhone(input: string): string {
	let digits = input.replace(/\D/g, "");

	if (digits.length === 11 && digits.startsWith("8")) {
		digits = `7${digits.slice(1)}`;
	}

	if (digits.length === 10) {
		digits = `7${digits}`;
	}

	return digits;
}

export function phoneToChatId(input: string): string {
	const trimmed = input.trim();

	if (trimmed.includes("@")) {
		return trimmed;
	}

	if (trimmed.startsWith("-")) {
		return trimmed;
	}

	const digits = normalizePhone(trimmed);

	// phone@c.us - формат GREEN-API Telegram
	if (digits.length >= 10 && digits.length <= 15) {
		return `${digits}@c.us`;
	}

	// Числовой Telegram user id
	if (/^\d+$/.test(trimmed)) {
		return trimmed;
	}

	return `${digits}@c.us`;
}

export function formatPhoneTitle(input: string): string {
	const trimmed = input.trim();

	if (trimmed.startsWith("-")) {
		return `Группа ${trimmed}`;
	}

	if (trimmed.includes("@")) {
		const phone = trimmed.replace(/@c\.us$/, "");
		return formatPhoneDigits(phone);
	}

	const digits = normalizePhone(trimmed);
	if (digits.length >= 10) {
		return formatPhoneDigits(digits);
	}

	return trimmed.startsWith("+") ? trimmed : `+${digits || trimmed}`;
}

function formatPhoneDigits(digits: string): string {
	if (digits.length === 11 && digits.startsWith("7")) {
		return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
	}
	return `+${digits}`;
}

export function isValidPhone(input: string): boolean {
	const trimmed = input.trim();

	if (trimmed.includes("@c.us")) {
		return true;
	}

	if (trimmed.startsWith("-") && /^-?\d+$/.test(trimmed)) {
		return true;
	}

	const digits = normalizePhone(trimmed);
	if (digits.length >= 10 && digits.length <= 15) {
		return true;
	}

	// Telegram user id (обычно короче номера)
	return /^\d{5,}$/.test(trimmed);
}
