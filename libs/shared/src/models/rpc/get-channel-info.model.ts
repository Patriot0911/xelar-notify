export interface ITwitchGetChannelInfoPayload {
  broadcasterId: string;
};

export interface ITwitchChannelInfoResult {
  broadcasterId: string;
  broadcasterLanguage?: string;
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
