import type { Message } from "@/types/global";
import type { MattermostConfig } from "@/types/mattermost";

interface MattermostAttachment {
	fallback: string;
	color?: string;
	text?: string;
}

interface MattermostMessage {
	text: string;
	attachments?: MattermostAttachment[];
}

export class MattermostSender {
	name = "Mattermost";
	private webhookUrl: string;

	constructor(config: MattermostConfig) {
		this.webhookUrl = config.webhookUrl;
	}

	/** Mattermost always renders markdown; escape special chars for plain bodies. */
	private escapeMarkdown(text: string): string {
		return text.replace(/([\\`*_{}[\]()#+\-.!|>~])/g, "\\$1");
	}

	async send(message: Message): Promise<void> {
		const summary = message.title ?? message.body;
		const body = message.markdown
			? message.body
			: this.escapeMarkdown(message.body);

		const payload: MattermostMessage = {
			text: message.title ? `#### ${message.title}` : "",
			attachments: [
				{
					fallback: summary,
					color: "#2eb886",
					text: body,
				},
			],
		};

		const response = await fetch(this.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(
				`Mattermost webhook returned status ${response.status}: ${body}`,
			);
		}
	}
}
