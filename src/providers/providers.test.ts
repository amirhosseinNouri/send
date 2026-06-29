import { afterEach, describe, expect, it, mock } from "bun:test";
import type { Message } from "@/types/global";
import { createSender } from "./index";

interface Captured {
	url: string;
	method: string;
	headers: Record<string, string>;
	body: unknown;
}

function mockFetch(status = 200): { captured: Captured[] } {
	const captured: Captured[] = [];
	globalThis.fetch = mock(async (url: string, init: RequestInit) => {
		captured.push({
			url: String(url),
			method: String(init.method),
			headers: init.headers as Record<string, string>,
			body: init.body ? JSON.parse(String(init.body)) : undefined,
		});
		return new Response("ok", { status });
	}) as unknown as typeof fetch;
	return { captured };
}

const release: Message = {
	title: "myapp v1.2.0 Released",
	body: "## Changes\n- fix a bug",
	markdown: true,
};

afterEach(() => {
	mock.restore();
});

describe("SlackSender", () => {
	it("builds header + body blocks with mrkdwn when markdown", async () => {
		const { captured } = mockFetch();
		await createSender({ provider: "slack", webhookUrl: "https://x" }).send(
			release,
		);
		const [req] = captured;
		expect(req?.method).toBe("POST");
		expect(req?.url).toBe("https://x");
		const body = req?.body as {
			text: string;
			blocks: Array<{ type: string; text?: { type: string; text: string } }>;
		};
		expect(body.text).toBe("myapp v1.2.0 Released");
		expect(body.blocks[0]?.type).toBe("header");
		const section = body.blocks.find((b) => b.type === "section");
		expect(section?.text?.type).toBe("mrkdwn");
		expect(section?.text?.text).toContain("fix a bug");
	});

	it("uses plain_text body when not markdown", async () => {
		const { captured } = mockFetch();
		await createSender({ provider: "slack", webhookUrl: "https://x" }).send({
			body: "*literal*",
		});
		const body = captured[0]?.body as {
			blocks: Array<{ type: string; text?: { type: string } }>;
		};
		const section = body.blocks.find((b) => b.type === "section");
		expect(section?.text?.type).toBe("plain_text");
	});

	it("omits header when no title", async () => {
		const { captured } = mockFetch();
		await createSender({ provider: "slack", webhookUrl: "https://x" }).send({
			body: "hello",
		});
		const body = captured[0]?.body as { blocks: Array<{ type: string }> };
		expect(body.blocks.some((b) => b.type === "header")).toBe(false);
	});

	it("throws on non-2xx", async () => {
		mockFetch(500);
		await expect(
			createSender({ provider: "slack", webhookUrl: "https://x" }).send({
				body: "hi",
			}),
		).rejects.toThrow(/status 500/);
	});
});

describe("TeamsSender", () => {
	it("maps body to text and sets markdown from the flag", async () => {
		const { captured } = mockFetch();
		await createSender({ provider: "teams", webhookUrl: "https://x" }).send(
			release,
		);
		const body = captured[0]?.body as {
			summary: string;
			sections: Array<{ text: string; markdown: boolean }>;
		};
		expect(body.summary).toBe("myapp v1.2.0 Released");
		expect(body.sections[0]?.markdown).toBe(true);
		expect(body.sections[0]?.text).toContain("fix a bug");
	});

	it("disables markdown when the flag is unset", async () => {
		const { captured } = mockFetch();
		await createSender({ provider: "teams", webhookUrl: "https://x" }).send({
			body: "plain",
		});
		const body = captured[0]?.body as {
			sections: Array<{ markdown: boolean }>;
		};
		expect(body.sections[0]?.markdown).toBe(false);
	});
});

describe("TelegramSender", () => {
	it("sends Markdown parse_mode with a bold title when markdown", async () => {
		const { captured } = mockFetch();
		await createSender({
			provider: "telegram",
			botToken: "T",
			chatId: "42",
		}).send(release);
		const req = captured[0];
		expect(req?.url).toBe("https://api.telegram.org/botT/sendMessage");
		const body = req?.body as {
			chat_id: string;
			text: string;
			parse_mode?: string;
		};
		expect(body.chat_id).toBe("42");
		expect(body.parse_mode).toBe("Markdown");
		expect(body.text).toContain("*myapp v1.2.0 Released*");
	});

	it("omits parse_mode and bolding when not markdown", async () => {
		const { captured } = mockFetch();
		await createSender({
			provider: "telegram",
			botToken: "T",
			chatId: "42",
		}).send({ title: "Hi", body: "the body" });
		const body = captured[0]?.body as { text: string; parse_mode?: string };
		expect(body.parse_mode).toBeUndefined();
		expect(body.text).toBe("Hi\n\nthe body");
	});
});

describe("ElementSender", () => {
	it("PUTs formatted html to the matrix room", async () => {
		const { captured } = mockFetch();
		await createSender({
			provider: "element",
			homeserverUrl: "https://hs",
			accessToken: "tok",
			roomId: "!room:hs",
		}).send(release);
		const req = captured[0];
		expect(req?.method).toBe("PUT");
		expect(req?.url).toContain(
			"/_matrix/client/v3/rooms/!room%3Ahs/send/m.room.message/",
		);
		expect(req?.headers).toMatchObject({ Authorization: "Bearer tok" });
		const body = req?.body as { formatted_body: string };
		expect(body.formatted_body).toContain("<strong>");
	});
});

describe("MattermostSender", () => {
	it("puts the body in the attachment text when markdown", async () => {
		const { captured } = mockFetch();
		await createSender({
			provider: "mattermost",
			webhookUrl: "https://x",
		}).send(release);
		const body = captured[0]?.body as {
			text: string;
			attachments: Array<{ text: string }>;
		};
		expect(body.text).toBe("#### myapp v1.2.0 Released");
		expect(body.attachments[0]?.text).toContain("fix a bug");
	});

	it("escapes markdown in the body when not markdown", async () => {
		const { captured } = mockFetch();
		await createSender({
			provider: "mattermost",
			webhookUrl: "https://x",
		}).send({ body: "*not bold*" });
		const body = captured[0]?.body as { attachments: Array<{ text: string }> };
		expect(body.attachments[0]?.text).toBe("\\*not bold\\*");
	});
});
