import type { ITwitchApiPaginationModel } from '../twitch-api-pagination.model';

export interface ITwitchApiChannelModel {
  id: string;
  broadcaster_language?: string;
  broadcaster_login: string;
  display_name: string;
  game_id: string;
  game_name?: string;
  is_live: boolean;
  tag_ids: string[];
  tags: string[];
  thumbnail_url: string;
  title?: string;
  started_at?: string;
};

export interface ITwitchApiChannelNormalizedModel {
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

export interface ITwitchChannelsApiResponseModel {
  data: ITwitchApiChannelModel[];
  pagination: ITwitchApiPaginationModel;
};

export interface ITwitchChannelApiResponseModel {
  data: [ITwitchApiChannelModel];
};
