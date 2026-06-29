import type { Sender, SenderConfig } from "@/types/global";
import { ElementSender } from "./element";
import { MattermostSender } from "./mattermost";
import { SlackSender } from "./slack";
import { TeamsSender } from "./teams";
import { TelegramSender } from "./telegram";

/** Every supported provider key. */
export const PROVIDERS = [
	"slack",
	"teams",
	"mattermost",
	"telegram",
	"element",
] as const;

/** Build a reusable {@link Sender} bound to a single provider configuration. */
export function createSender(config: SenderConfig): Sender {
	switch (config.provider) {
		case "slack":
			return new SlackSender(config);
		case "teams":
			return new TeamsSender(config);
		case "mattermost":
			return new MattermostSender(config);
		case "telegram":
			return new TelegramSender(config);
		case "element":
			return new ElementSender(config);
	}
}
