export const REDIS_CLIENT = 'REDIS_CLIENT';

export const twitchWebhookSecret = (clientId: string) =>
  `twitch:webhook:secret:${clientId}`;

export const twitchWebhookMessage = (messageId: string) =>
  `twitch:webhook:log:${messageId}`;

export const accessTokenBlackList = (jti: string) =>
  `blacklist:access:${jti}`;

export const botGuildIds = () =>
  'discord:bot:guild_ids';

export const userGuilds = (userId: string) =>
  `discord:users:${userId}:guild_ids`;

export const discordGuildChannels = (guildId: string) =>
  `discord:guild:${guildId}:channels`;

export const discordGuildRoles = (guildId: string) =>
  `discord:guild:${guildId}:roles`;

export const guildUserAccess = (guildId: string, userId: string) =>
  `discord:guild_access:${guildId}:${userId}`;

export const guildUserAccessPattern = (guildId: string) =>
  `discord:guild_access:${guildId}:*`;
