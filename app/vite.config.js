import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "",
	build: {
		rollupOptions: {
			maxParallelFileOps: 50,
		},
		outDir: "./docs",
	},
	optimizeDeps: {
		disabled: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				"./"
			),
		},
	},
});
