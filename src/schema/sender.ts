import { z } from "zod";
import { elementConfigSchema } from "./element";
import { mattermostConfigSchema } from "./mattermost";
import { slackConfigSchema } from "./slack";
import { teamsConfigSchema } from "./teams";
import { telegramConfigSchema } from "./telegram";

export const messageSchema = z.object({
	title: z.string().optional(),
	body: z.string(),
	/** Render the body as markdown in the provider's native format. */
	markdown: z.boolean().optional(),
});

export const senderConfigSchema = z.discriminatedUnion("provider", [
	slackConfigSchema,
	teamsConfigSchema,
	mattermostConfigSchema,
	telegramConfigSchema,
	elementConfigSchema,
]);

/** Schema for the flat one-shot `send()` input (config merged with message). */
export const sendInputSchema = z.intersection(
	senderConfigSchema,
	messageSchema,
);

/** Per-provider config schemas, keyed by provider, for consumers to reuse. */
export const providerConfigSchemas = {
	slack: slackConfigSchema,
	teams: teamsConfigSchema,
	mattermost: mattermostConfigSchema,
	telegram: telegramConfigSchema,
	element: elementConfigSchema,
} as const;
