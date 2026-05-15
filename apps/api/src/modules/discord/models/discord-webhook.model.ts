export interface IDiscordApiWebhookModel {
  applicationId: string | null;
  avatar: string | null;
  channelId: string;
  guildId: string;
  id: string;
  name: string;
  type: number;
  token: string;
  url: string;
};
