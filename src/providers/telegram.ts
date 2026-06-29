import type { Message } from "@/types/global";
import type { TelegramConfig } from "@/types/telegram";

export class TelegramSender {
	name = "Telegram";
	private botToken: string;
	private chatId: string;

	constructor(config: TelegramConfig) {
		this.botToken = config.botToken;
		this.chatId = config.chatId;
	}

	private escapeMarkdown(text: string): string {
		return text.replace(/([*_`[])/g, "\\$1");
	}

	async send(message: Message): Promise<void> {
		const lines: string[] = [];

		if (message.markdown) {
			if (message.title) {
				lines.push(`*${this.escapeMarkdown(message.title)}*`, "");
			}
			// Body is the caller's own markdown — pass it through untouched.
			lines.push(message.body);
		} else {
			if (message.title) lines.push(message.title, "");
			lines.push(message.body);
		}

		const text = lines.join("\n");
		const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: this.chatId,
				text,
				...(message.markdown ? { parse_mode: "Markdown" } : {}),
			}),
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(
				`Telegram API returned status ${response.status}: ${body}`,
			);
		}
	}
}
