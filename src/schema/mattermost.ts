import { z } from "zod";

export const mattermostConfigSchema = z.object({
	provider: z.literal("mattermost"),
	webhookUrl: z.url(),
});
