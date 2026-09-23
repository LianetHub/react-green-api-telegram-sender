import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import { defineConfig, type ProxyOptions } from "vite";

const greenApiProxy = {
	target: "https://api.green-api.com",
	changeOrigin: true,
	secure: true,
	timeout: 0,
	proxyTimeout: 70_000,
	rewrite: (path: string) => path.replace(/^\/green-api\/\d+/, ""),
	router: (req: IncomingMessage) => {
		const match = req.url?.match(/^\/green-api\/(\d+)/);
		if (match) {
			return `https://${match[1]}.api.green-api.com`;
		}
		return "https://api.green-api.com";
	},
} as ProxyOptions;

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/green-api": greenApiProxy,
		},
	},
	preview: {
		proxy: {
			"/green-api": greenApiProxy,
		},
	},
});
