import { describe, expect, it } from "bun:test";
import { messageSchema, senderConfigSchema } from "./schema/sender";

describe("senderConfigSchema", () => {
	it("accepts a valid slack config", () => {
		expect(
			senderConfigSchema.safeParse({
				provider: "slack",
				webhookUrl: "https://hooks.slack.com/x",
			}).success,
		).toBe(true);
	});

	it("rejects an unknown provider", () => {
		expect(
			senderConfigSchema.safeParse({
				provider: "discord",
				webhookUrl: "https://x",
			}).success,
		).toBe(false);
	});

	it("rejects a non-url webhook", () => {
		expect(
			senderConfigSchema.safeParse({
				provider: "slack",
				webhookUrl: "not-a-url",
			}).success,
		).toBe(false);
	});

	it("requires telegram bot token and chat id", () => {
		expect(
			senderConfigSchema.safeParse({ provider: "telegram", botToken: "t" })
				.success,
		).toBe(false);
	});
});

describe("messageSchema", () => {
	it("requires a body", () => {
		expect(messageSchema.safeParse({ title: "hi" }).success).toBe(false);
	});

	it("accepts body-only", () => {
		expect(messageSchema.safeParse({ body: "hello" }).success).toBe(true);
	});
});
