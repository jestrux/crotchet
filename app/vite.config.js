import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function extensionWatcher() {
	return {
		name: "custom-hmr",
		apply: "serve",
		enforce: "post",
		async handleHotUpdate({ file, server }) {
			if (file.endsWith(".ext.ts")) {
				const name = file
					.split("extensions/")
					.pop()
					.replace(".ext.ts", "");
				const contents = await fs.promises.readFile(file, {
					encoding: "utf-8",
				});

				server.ws.send({
					type: "custom",
					event: "reload-extension",
					data: {
						name,
						contents,
					},
				});
			}
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), extensionWatcher()],
	base: "",
	build: {
		rollupOptions: {
			maxParallelFileOps: 50,
		},
		outDir: "./docs",
	},
	server: {
		port: 5170,
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
