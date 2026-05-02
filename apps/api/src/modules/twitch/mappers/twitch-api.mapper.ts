import { Injectable } from '@nestjs/common';
import { ITwitchApiChannelModel, ITwitchApiChannelNormalizedModel } from '../models';

@Injectable()
export class TwitchApiMapper {
  TwitchApiChannelToNormalized(channel: ITwitchApiChannelModel): ITwitchApiChannelNormalizedModel {
    return {
      twitchId: channel.id,
      broadcasterLogin: channel.broadcaster_login,
      displayName: channel.display_name,
      broadcasterLanguage: channel.broadcaster_language,
      thumbnailUrl: channel.thumbnail_url,
      gameName: channel.game_name,
      gameId: channel.game_id,
      tagIds: channel.tag_ids,
      tags: channel.tags,
      isLive: channel.is_live,
      streamStartedAt: channel.started_at,
      streamTitle: channel.title,
    };
  }
}
