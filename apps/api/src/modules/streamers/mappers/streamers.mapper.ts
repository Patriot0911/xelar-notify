import { Injectable } from '@nestjs/common';
import { NotificationLogEntity, TwitchStreamerEntity } from '@libs/database';
import { IStreamerItemModel, IStreamerListItemModel, IStreamerNotificationLogModel } from '../models';

@Injectable()
export class StreamersMapper {
  entityToListItem(streamer: TwitchStreamerEntity): IStreamerListItemModel {
    const {
      id,
      broadcasterId,
      twitchLogin,
      displayName,
      profileImageUrl,
      isPartner,
      isInternal,
      allowPersonalSubscriptions,
      userId,
      createdAt,
    } = streamer;

    return {
      id,
      broadcasterId,
      twitchLogin,
      displayName,
      profileImageUrl: profileImageUrl ?? null,
      isPartner,
      isInternal: !!isInternal,
      allowPersonalSubscriptions,
      linkedUserId: userId ?? null,
      createdAt,
    };
  }

  entityToItem(streamer: TwitchStreamerEntity): IStreamerItemModel {
    return {
      ...this.entityToListItem(streamer),
      linkedUserDisplayName: streamer.user?.displayName ?? null,
      linkedUserEmail: streamer.user?.email ?? null,
    };
  }

  notificationLogToItem(log: NotificationLogEntity): IStreamerNotificationLogModel {
    return {
      id: log.id,
      notificationId: log.notificationId,
      notificationType: log.notificationType,
      status: log.status,
      eventType: log.eventType,
      errorMessage: log.errorMessage ?? null,
      createdAt: log.createdAt,
    };
  }
}
