export interface ITwitchStreamOnlineEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: string;
  started_at: string;
}

export interface IStreamOnlineMessage {
  subscription: { id: string };
  event: ITwitchStreamOnlineEvent;
}

export interface IDiscordNotificationMessage {
  notificationId: string;
  channelId: string;
  discordGuildId: string;
  messagePayload: unknown;
};
