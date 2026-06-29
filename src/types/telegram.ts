import type { z } from "zod";
import type { telegramConfigSchema } from "@/schema/telegram";

export type TelegramConfig = z.infer<typeof telegramConfigSchema>;
