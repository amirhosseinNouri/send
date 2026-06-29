import type { z } from "zod";
import type { elementConfigSchema } from "@/schema/element";

export type ElementConfig = z.infer<typeof elementConfigSchema>;
