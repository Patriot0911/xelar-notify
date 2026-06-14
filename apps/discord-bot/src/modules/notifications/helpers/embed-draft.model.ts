export interface EmbedDraft {
  content: string;
  title: string;
  description: string;
  color: string;
  imageUrl: string;
}

export const DEFAULT_EMBED_DRAFT: EmbedDraft = {
  content: '${streamerName} is now live!',
  title: '${streamerName} is now live!',
  description: 'Watch the stream live!',
  color: '#9146FF',
  imageUrl: '${thumbnailUrl}',
};
