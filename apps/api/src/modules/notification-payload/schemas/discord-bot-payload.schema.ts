import { z } from 'zod';
import {
  CONTENT_OR_EMBEDS_MESSAGE,
  NotificationPayloadObjectSchema,
  hasContentOrEmbeds,
} from './base-payload.schema';

// Discord bot messages via channel.send() — username override is not available
export const DiscordBotPayloadSchema = NotificationPayloadObjectSchema
  .refine(hasContentOrEmbeds, CONTENT_OR_EMBEDS_MESSAGE);

export type TDiscordBotPayload = z.infer<typeof DiscordBotPayloadSchema>;
