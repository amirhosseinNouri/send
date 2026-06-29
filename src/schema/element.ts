import { z } from "zod";

export const elementConfigSchema = z.object({
	provider: z.literal("element"),
	homeserverUrl: z.url(),
	accessToken: z.string(),
	roomId: z.string(),
});
