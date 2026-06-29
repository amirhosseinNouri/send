import { z } from "zod";

export const slackConfigSchema = z.object({
	provider: z.literal("slack"),
	webhookUrl: z.url(),
});
