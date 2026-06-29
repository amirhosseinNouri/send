import type { z } from "zod";
import type { slackConfigSchema } from "@/schema/slack";

export type SlackConfig = z.infer<typeof slackConfigSchema>;
