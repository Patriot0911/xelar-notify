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
  channelInfo?: {
    broadcasterId: string;
    broadcasterLogin: string;
    displayName: string;
    gameId: string;
    gameName?: string;
    isLive: boolean;
    tagIds: string[];
    tags: string[];
    thumbnailUrl: string;
    streamTitle?: string;
    streamStartedAt?: string;
  };
}

export interface IDiscordNotificationMessage {
  notificationId: string;
  channelId: string;
  discordGuildId: string;
  messagePayload: unknown;
};
