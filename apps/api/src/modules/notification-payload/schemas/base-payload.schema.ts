import { z } from 'zod';

export const EmbedSchema = z.object({
  title:       z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  color:       z.number().int().min(0).max(0xFFFFFF).optional(),
  url:         z.url().optional(),
  fields:      z.array(z.object({
    name:   z.string().max(256),
    value:  z.string().max(1024),
    inline: z.boolean().optional(),
  })).max(25).optional(),
  footer:    z.object({ text: z.string().max(2048) }).optional(),
  thumbnail: z.object({ url: z.url() }).optional(),
  image:     z.object({ url: z.url() }).optional(),
  timestamp: z.string().datetime().optional(),
});

// Raw object without .refine() so extended schemas can call .extend() on it
export const NotificationPayloadObjectSchema = z.object({
  content: z.string().max(2000).optional(),
  embeds:  z.array(EmbedSchema).max(10).optional(),
  actions: z.array(z.record(z.unknown())).optional(),
});

export const hasContentOrEmbeds = (
  data: Pick<z.infer<typeof NotificationPayloadObjectSchema>, 'content' | 'embeds'>,
) => !!data.content || (data.embeds?.length ?? 0) > 0;

export const CONTENT_OR_EMBEDS_MESSAGE = { message: 'Either content or embeds must be provided' };

export type TEmbed = z.infer<typeof EmbedSchema>;
export type TNotificationPayloadObject = z.infer<typeof NotificationPayloadObjectSchema>;
