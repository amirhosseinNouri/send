import type { z } from "zod";
import type { mattermostConfigSchema } from "@/schema/mattermost";

export type MattermostConfig = z.infer<typeof mattermostConfigSchema>;
