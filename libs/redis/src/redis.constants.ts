export const REDIS_CLIENT = 'REDIS_CLIENT';

export const twitchWebhookSecret = (clientId: string) =>
  `twitch:webhook:secret:${clientId}`;
