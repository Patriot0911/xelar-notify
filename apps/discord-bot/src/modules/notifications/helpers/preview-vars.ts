export const PREVIEW_VARS: Record<string, string> = {
  streamerName: 'ExampleStreamer',
  streamerLogin: 'examplestreamer',
  streamerId: '123456789',
  streamType: 'live',
  startedAt: new Date().toISOString(),
  streamUrl: 'https://twitch.tv/examplestreamer',
  thumbnailUrl: 'https://static-cdn.jtvnw.net/ttv-static/404_preview-1280x720.jpg',
  avatarUrl: 'https://static-cdn.jtvnw.net/ttv-static/404_user_70x70.jpg',
};

export function interpolateForPreview(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (match, key: string) => PREVIEW_VARS[key] ?? match);
}
