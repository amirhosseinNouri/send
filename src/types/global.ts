import type { z } from "zod";
import type { messageSchema, senderConfigSchema } from "@/schema/sender";

/**
 * A provider-agnostic structured message. Each provider renders the body into
 * its own native format (Slack blocks, Teams card, Telegram markdown, ...),
 * optionally as markdown when {@link Message.markdown} is set.
 */
export type Message = z.infer<typeof messageSchema>;

/** Discriminated union of every supported provider configuration. */
export type SenderConfig = z.infer<typeof senderConfigSchema>;

/** Every supported provider key, derived from the config schema discriminant. */
export type ChatProvider = SenderConfig["provider"];

/** A configured, reusable sender bound to a single provider. */
export interface Sender {
	/** Human-readable provider name, e.g. "Slack". */
	name: string;
	send(message: Message): Promise<void>;
}

/** Flat one-shot input: provider config merged with the message. */
export type SendInput = SenderConfig & Message;
