import { createSender, PROVIDERS } from "./providers";
import type { ElementConfig } from "./types/element";
import type {
	ChatProvider,
	Message,
	Sender,
	SenderConfig,
	SendInput,
} from "./types/global";
import type { MattermostConfig } from "./types/mattermost";
import type { SlackConfig } from "./types/slack";
import type { TeamsConfig } from "./types/teams";
import type { TelegramConfig } from "./types/telegram";

export { createSender, PROVIDERS };

export { elementConfigSchema } from "./schema/element";
export { mattermostConfigSchema } from "./schema/mattermost";
export {
	messageSchema,
	providerConfigSchemas,
	senderConfigSchema,
	sendInputSchema,
} from "./schema/sender";
export { slackConfigSchema } from "./schema/slack";
export { teamsConfigSchema } from "./schema/teams";
export { telegramConfigSchema } from "./schema/telegram";
export type {
	ChatProvider,
	ElementConfig,
	MattermostConfig,
	Message,
	Sender,
	SenderConfig,
	SendInput,
	SlackConfig,
	TeamsConfig,
	TelegramConfig,
};

/**
 * Send a single message in one call. Convenience wrapper that splits the flat
 * input into a provider config and a message, then dispatches.
 *
 * @example
 * await send({ provider: "slack", webhookUrl, title: "Hi", body: "world" });
 */
export async function send(input: SendInput): Promise<void> {
	const { title, body, markdown, ...config } = input;
	const message: Message = { title, body, markdown };
	await createSender(config as SenderConfig).send(message);
}
