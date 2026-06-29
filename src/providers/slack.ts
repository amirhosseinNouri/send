import type { Message } from "@/types/global";
import type { SlackConfig } from "@/types/slack";

interface SlackBlock {
	type: string;
	text?: { type: string; text: string };
}

interface SlackMessage {
	text: string;
	blocks: SlackBlock[];
}

export class SlackSender {
	name = "Slack";
	private webhookUrl: string;

	constructor(config: SlackConfig) {
		this.webhookUrl = config.webhookUrl;
	}

	async send(message: Message): Promise<void> {
		const summary = message.title ?? message.body;

		const blocks: SlackBlock[] = [];

		if (message.title) {
			blocks.push({
				type: "header",
				text: { type: "plain_text", text: message.title },
			});
		}

		blocks.push({ type: "divider" });
		blocks.push({
			type: "section",
			text: {
				type: message.markdown ? "mrkdwn" : "plain_text",
				text: message.body,
			},
		});

		const payload: SlackMessage = { text: summary, blocks };

		const response = await fetch(this.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(
				`Slack webhook returned status ${response.status}: ${body}`,
			);
		}
	}
}
