import { z } from 'zod';

export const DiscordWebhookPayloadSchema = z.object({
  content:  z.string().max(2000).optional(),
  username: z.string().max(80).optional(),
  embeds:   z.array(
    z.object({
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
      thumbnail: z.object({ url: z.string().url() }).optional(),
      image:     z.object({ url: z.string().url() }).optional(),
      timestamp: z.string().datetime().optional(),
    }),
  ).max(10).optional(),
}).refine(
  (data) => data.content || (data.embeds?.length ?? 0) > 0,
  { message: 'Either content or embeds must be provided' },
);

export type TDiscordWebhookPayload = z.infer<typeof DiscordWebhookPayloadSchema>;
