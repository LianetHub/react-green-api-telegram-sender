import { useState } from "react";
import { getStateInstance, isUnauthorized } from "./api";
import { ChatApp } from "./components/ChatApp";
import { LoginForm } from "./components/LoginForm";
import type { Credentials } from "./types";
import {
	clearCredentials,
	loadCredentials,
	saveCredentials,
} from "./utils/credentials";

function App() {
	const [credentials, setCredentials] = useState<Credentials | null>(() =>
		loadCredentials(),
	);

	const handleLogin = async (next: Credentials) => {
		try {
			await getStateInstance(next);
		} catch (error) {
			if (isUnauthorized(error)) {
				throw new Error("Неверные idInstance или apiTokenInstance", {
					cause: error,
				});
			}
			if (error instanceof Error) {
				throw error;
			}
			throw new Error("Не удалось проверить данные инстанса", {
				cause: error,
			});
		}

		saveCredentials(next);
		setCredentials(next);
	};

	const handleLogout = () => {
		clearCredentials();
		setCredentials(null);
	};

	if (!credentials) {
		return <LoginForm onLogin={handleLogin} />;
	}

	return <ChatApp credentials={credentials} onLogout={handleLogout} />;
}

export default App;
