import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Credentials } from "../types";

type Options = {
	onLogin: (credentials: Credentials) => Promise<void>;
};

export function useLoginForm({ onLogin }: Options) {
	const [idInstance, setIdInstance] = useState("");
	const [apiTokenInstance, setApiTokenInstance] = useState("");
	const [error, setError] = useState("");
	const [checking, setChecking] = useState(false);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const id = idInstance.trim();
		const token = apiTokenInstance.trim();

		if (!id || !token) {
			setError("Заполните idInstance и apiTokenInstance");
			return;
		}

		if (!/^\d+$/.test(id)) {
			setError("idInstance должен содержать только цифры");
			return;
		}

		setError("");
		setChecking(true);
		try {
			await onLogin({ idInstance: id, apiTokenInstance: token });
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Не удалось проверить данные",
			);
		} finally {
			setChecking(false);
		}
	};

	return {
		idInstance,
		setIdInstance,
		apiTokenInstance,
		setApiTokenInstance,
		error,
		checking,
		handleSubmit,
	};
}
