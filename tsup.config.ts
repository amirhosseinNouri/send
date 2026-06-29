import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["cjs", "esm"],
		outDir: "dist",
		clean: true,
		dts: true,
		minify: false,
		sourcemap: false,
		target: "node18",
		external: ["zod", "marked", "command-line-args"],
	},
	{
		entry: ["src/cli.ts"],
		format: ["cjs"],
		outDir: "dist",
		clean: false,
		minify: false,
		sourcemap: false,
		target: "node18",
		external: ["zod", "marked", "command-line-args"],
		banner: {
			js: "#!/usr/bin/env node",
		},
	},
]);
