import { z } from 'zod';

// Matches any string that contains at least one ${variableName} placeholder
const TEMPLATE_VAR_RE = /\$\{[\w]+\}/;

// Accepts a valid URL or a string containing a template variable like ${thumbnailUrl}
export const urlOrTemplate = z.union([
  z.url(),
  z.string().regex(TEMPLATE_VAR_RE, 'Must be a valid URL or contain a template variable like ${variableName}'),
]);

export const EmbedSchema = z.object({
  title:       z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  color:       z.number().int().min(0).max(0xFFFFFF).optional(),
  url:         urlOrTemplate.optional(),
  fields:      z.array(z.object({
    name:   z.string().max(256),
    value:  z.string().max(1024),
    inline: z.boolean().optional(),
  })).max(25).optional(),
  author: z.object({
    name:     z.string().max(256),
    url:      urlOrTemplate.optional(),
    icon_url: urlOrTemplate.optional(),
  }).optional(),
  footer: z.object({
    text:     z.string().max(2048),
    icon_url: urlOrTemplate.optional(),
  }).optional(),
  thumbnail: z.object({ url: urlOrTemplate }).optional(),
  image:     z.object({ url: urlOrTemplate }).optional(),
  timestamp: z.union([z.string().datetime(), z.string().regex(TEMPLATE_VAR_RE)]).optional(),
});

// Raw object without .refine() so extended schemas can call .extend() on it
export const NotificationPayloadObjectSchema = z.object({
  content: z.string().max(2000).optional(),
  embeds:  z.array(EmbedSchema).max(10).optional(),
  actions: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const hasContentOrEmbeds = (
  data: Pick<z.infer<typeof NotificationPayloadObjectSchema>, 'content' | 'embeds'>,
) => !!data.content || (data.embeds?.length ?? 0) > 0;

export const CONTENT_OR_EMBEDS_MESSAGE = { message: 'Either content or embeds must be provided' };

export type TEmbed = z.infer<typeof EmbedSchema>;
export type TNotificationPayloadObject = z.infer<typeof NotificationPayloadObjectSchema>;
