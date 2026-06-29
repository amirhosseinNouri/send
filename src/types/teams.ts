import type { z } from "zod";
import type { teamsConfigSchema } from "@/schema/teams";

export type TeamsConfig = z.infer<typeof teamsConfigSchema>;
