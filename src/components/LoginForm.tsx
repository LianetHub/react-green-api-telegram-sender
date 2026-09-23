import type { Credentials } from "../types";
import { useLoginForm } from "../hooks/useLoginForm";

type Props = {
	onLogin: (credentials: Credentials) => Promise<void>;
};

export function LoginForm({ onLogin }: Props) {
	const {
		idInstance,
		setIdInstance,
		apiTokenInstance,
		setApiTokenInstance,
		error,
		checking,
		handleSubmit,
	} = useLoginForm({ onLogin });

	return (
		<div className="login-page">
			<form className="login-card" onSubmit={(e) => void handleSubmit(e)}>
				<h1 className="login-title">Telegram Chat</h1>
				<p className="login-subtitle">
					Введите данные Telegram-инстанса GREEN-API
				</p>

				<label className="field">
					<span>idInstance</span>
					<input
						type="text"
						autoComplete="username"
						value={idInstance}
						onChange={(e) => setIdInstance(e.target.value)}
						placeholder="1101000000"
						disabled={checking}
					/>
				</label>

				<label className="field">
					<span>apiTokenInstance</span>
					<input
						type="password"
						autoComplete="current-password"
						value={apiTokenInstance}
						onChange={(e) => setApiTokenInstance(e.target.value)}
						placeholder="Токен из личного кабинета"
						disabled={checking}
					/>
				</label>

				{error ? <p className="form-error">{error}</p> : null}

				<button type="submit" className="btn primary" disabled={checking}>
					{checking ? "Проверка…" : "Войти"}
				</button>
			</form>
		</div>
	);
}
