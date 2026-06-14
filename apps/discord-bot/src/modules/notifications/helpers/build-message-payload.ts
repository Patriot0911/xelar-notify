import { EmbedDraft } from './embed-draft.model';

const DEFAULT_COLOR = 0x9146FF;

export interface DraftMessagePayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    image?: { url: string };
  }>;
}

function parseColor(color: string): number {
  const hex = color.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return DEFAULT_COLOR;
  return parseInt(hex, 16);
}

export function buildMessagePayload(draft: EmbedDraft, transform: (value: string) => string = (value) => value): DraftMessagePayload {
  const payload: DraftMessagePayload = {};

  const content = transform(draft.content.trim());
  if (content) payload.content = content;

  const title = transform(draft.title.trim());
  const description = transform(draft.description.trim());
  const imageUrl = transform(draft.imageUrl.trim());

  if (title || description || imageUrl) {
    payload.embeds = [{
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(imageUrl ? { image: { url: imageUrl } } : {}),
      color: parseColor(draft.color),
    }];
  }

  return payload;
}
