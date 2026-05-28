export const REDIS_CLIENT = 'REDIS_CLIENT';

export const twitchWebhookSecret = (clientId: string) =>
  `twitch:webhook:secret:${clientId}`;

export const twitchWebhookMessage = (messageId: string) =>
  `twitch:webhook:log:${messageId}`;

export const accessTokenBlackList = (jti: string) =>
  `blacklist:access:${jti}`;
