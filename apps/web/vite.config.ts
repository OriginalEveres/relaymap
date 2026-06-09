import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3001,
		host: true,
		proxy: {
			"/api": {
				target: process.env.API_PROXY_TARGET ?? "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
});
