import { z } from "zod";

export const telegramConfigSchema = z.object({
	provider: z.literal("telegram"),
	botToken: z.string(),
	chatId: z.string(),
});
