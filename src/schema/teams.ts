import { z } from "zod";

export const teamsConfigSchema = z.object({
	provider: z.literal("teams"),
	webhookUrl: z.url(),
});
