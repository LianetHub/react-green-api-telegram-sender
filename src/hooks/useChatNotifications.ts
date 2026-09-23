import { useCallback, useState } from "react";
import type { Credentials } from "../types";
import {
	useNotificationPoll,
	type IncomingPayload,
} from "./useNotificationPoll";

type Options = {
	credentials: Credentials;
	onMessage: (payload: IncomingPayload) => void;
};

export function useChatNotifications({ credentials, onMessage }: Options) {
	const [pollError, setPollError] = useState("");

	const handlePollError = useCallback((error: Error) => {
		setPollError(error.message);
	}, []);

	const handlePollOk = useCallback(() => {
		setPollError("");
	}, []);

	useNotificationPoll({
		credentials,
		onMessage,
		onError: handlePollError,
		onPollOk: handlePollOk,
	});

	return pollError;
}
