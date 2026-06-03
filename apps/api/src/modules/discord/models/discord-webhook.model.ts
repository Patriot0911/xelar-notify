export interface IDiscordApiWebhookModel {
  application_id: string | null;
  avatar: string | null;
  channel_id: string;
  guild_id: string;
  id: string;
  name: string;
  type: number;
  token: string;
  url: string;
};

export interface IDiscordWebhookModel {
  applicationId: string | null;
  avatar: string | null;
  channelId: string;
  guildId: string;
  id: string;
  name: string;
  type: number;
  token: string;
  url: string;
}
