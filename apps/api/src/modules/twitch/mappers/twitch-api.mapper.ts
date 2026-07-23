import { Injectable } from '@nestjs/common';
import { ITwitchApiCategoryModel, ITwitchApiCategoryNormalizedModel, ITwitchApiChannelModel, ITwitchApiChannelNormalizedModel, ITwitchApiUserModel, ITwitchApiUserNormalizedModel } from '../models';

@Injectable()
export class TwitchApiMapper {
  twitchApiCategoryToNormalized(category: ITwitchApiCategoryModel): ITwitchApiCategoryNormalizedModel {
    return {
      id: category.id,
      name: category.name,
      boxArtUrl: category.box_art_url,
    };
  }

  twitchApiChannelToNormalized(channel: ITwitchApiChannelModel): ITwitchApiChannelNormalizedModel {
    return {
      broadcasterId: channel.id,
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

  twitchApiUserToNormalized(broadcaster: ITwitchApiUserModel): ITwitchApiUserNormalizedModel {
    return {
      broadcasterId: broadcaster.id,
      broadcasterType: broadcaster.broadcaster_type,
      createdAt: new Date(broadcaster.created_at),
      description: broadcaster.description,
      displayName: broadcaster.display_name,
      email: broadcaster.email,
      login: broadcaster.login,
      type: broadcaster.type,
      viewCount: broadcaster.view_count,
      offlineImageUrl: broadcaster.offline_image_url,
      profileImageUrl: broadcaster.profile_image_url,
    };
  }
}
