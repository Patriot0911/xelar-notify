import { z } from 'zod';
import {
  CONTENT_OR_EMBEDS_MESSAGE,
  NotificationPayloadObjectSchema,
  hasContentOrEmbeds,
  urlOrTemplate,
} from './base-payload.schema';

// Discord Webhook messages — supports username/avatar override unlike bot messages
export const DiscordWebhookPayloadSchema = NotificationPayloadObjectSchema
  .extend({
    username:   z.string().max(80).optional(),
    avatar_url: urlOrTemplate.optional(),
  })
  .refine(hasContentOrEmbeds, CONTENT_OR_EMBEDS_MESSAGE);

export type TDiscordWebhookPayload = z.infer<typeof DiscordWebhookPayloadSchema>;
