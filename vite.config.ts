import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/green-api": {
				target: "https://api.green-api.com",
				changeOrigin: true,
				secure: true,
				// Long-poll receiveNotification needs > receiveTimeout
				timeout: 0,
				proxyTimeout: 70_000,
				rewrite: (path) => path.replace(/^\/green-api\/\d+/, ""),
				router: (req: IncomingMessage) => {
					const match = req.url?.match(/^\/green-api\/(\d+)/);
					if (match) {
						return `https://${match[1]}.api.green-api.com`;
					}
					return "https://api.green-api.com";
				},
			} as import("vite").ProxyOptions,
		},
	},
});
