import type { Message } from "@/types/global";
import type { TeamsConfig } from "@/types/teams";

interface TeamsMessageCard {
	"@type": string;
	"@context": string;
	themeColor: string;
	summary: string;
	sections: Array<{
		activityTitle?: string;
		text?: string;
		markdown: boolean;
	}>;
}

export class TeamsSender {
	name = "Microsoft Teams";
	private webhookUrl: string;

	constructor(config: TeamsConfig) {
		this.webhookUrl = config.webhookUrl;
	}

	async send(message: Message): Promise<void> {
		const summary = message.title ?? message.body;

		const messageCard: TeamsMessageCard = {
			"@type": "MessageCard",
			"@context": "https://schema.org/extensions",
			themeColor: "0078D7",
			summary,
			sections: [
				{
					activityTitle: message.title,
					text: message.body,
					markdown: message.markdown ?? false,
				},
			],
		};

		const response = await fetch(this.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(messageCard),
		});

		if (!response.ok) {
			throw new Error(
				`Teams webhook returned status ${response.status}: ${response.statusText}`,
			);
		}
	}
}
