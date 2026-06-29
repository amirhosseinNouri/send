import type commandLineArgs from "command-line-args";
import { senderConfigSchema } from "@/schema/sender";

/** camelCase schema key → kebab-case CLI flag (webhookUrl → webhook-url). */
export const toKebab = (key: string): string =>
	key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** kebab CLI flag → camelCase schema key, for display as the user typed it. */
export const flagFor = (key: string): string => `--${toKebab(key)}`;

/**
 * Every config field across all provider variants, derived from the zod
 * schema so flags, types, and validation share one source of truth.
 */
export const configKeys: readonly string[] = [
	...new Set(
		senderConfigSchema.options.flatMap((option) => Object.keys(option.shape)),
	),
];

/** Config flags (kebab) for command-line-args, derived from the schema. */
const configOptionDefinitions = configKeys.map((key) => ({
	name: toKebab(key),
	type: String,
}));

/** Full CLI option set: schema-derived config flags plus message/control flags. */
export const optionDefinitions: commandLineArgs.OptionDefinition[] = [
	...configOptionDefinitions,
	{ name: "title", type: String },
	{ name: "body", type: String },
	{ name: "markdown", type: Boolean },
	{ name: "help", alias: "h", type: Boolean },
];
