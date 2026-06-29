import { marked } from "marked";
import type { ElementConfig } from "@/types/element";
import type { Message } from "@/types/global";

export class ElementSender {
	name = "Element";
	private homeserverUrl: string;
	private accessToken: string;
	private roomId: string;

	constructor(config: ElementConfig) {
		this.homeserverUrl = config.homeserverUrl;
		this.accessToken = config.accessToken;
		this.roomId = config.roomId;
	}

	async send(message: Message): Promise<void> {
		const lines: string[] = [];

		if (message.title) {
			lines.push(message.markdown ? `**${message.title}**` : message.title, "");
		}

		lines.push(message.body);

		const body = lines.join("\n");
		const formatted = message.markdown
			? {
					format: "org.matrix.custom.html",
					formatted_body: await marked.parse(body, { async: true }),
				}
			: {};

		const txnId = `send-${Date.now()}`;
		const encodedRoomId = encodeURIComponent(this.roomId);
		const url = `${this.homeserverUrl}/_matrix/client/v3/rooms/${encodedRoomId}/send/m.room.message/${txnId}`;

		let response: Response;
		try {
			response = await fetch(url, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.accessToken}`,
				},
				body: JSON.stringify({
					msgtype: "m.text",
					body,
					...formatted,
				}),
			});
		} catch (error) {
			const cause =
				error instanceof Error ? (error.cause ?? error.message) : error;
			throw new Error(`Element fetch failed: ${JSON.stringify(cause)}`);
		}

		if (!response.ok) {
			const responseBody = await response.text();
			throw new Error(
				`Element API returned status ${response.status}: ${responseBody}`,
			);
		}
	}
}
