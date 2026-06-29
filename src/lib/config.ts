import type { z } from "zod";
import { flagFor } from "@/lib/flags";
import { senderConfigSchema } from "@/schema/sender";
import type { SenderConfig } from "@/types/global";

/** Render a config validation error against the CLI flags the user actually types. */
function formatConfigError(error: z.ZodError): string {
	const lines = error.issues.map((issue) => {
		const key = issue.path[0];
		const where = typeof key === "string" ? flagFor(key) : "config";
		return `  → ${where}: ${issue.message}`;
	});
	return `Invalid provider config:\n${lines.join("\n")}`;
}

/**
 * Validate raw CLI values against the provider schema. Unknown keys (message
 * flags, etc.) are stripped, so the parsed CLI options can be passed straight
 * through — the schema is the single source of truth for provider config.
 */
export function parseConfig(values: Record<string, unknown>): SenderConfig {
	const result = senderConfigSchema.safeParse(values);
	if (!result.success) {
		throw new Error(formatConfigError(result.error));
	}
	return result.data;
}
