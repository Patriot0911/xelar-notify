import { Injectable } from '@nestjs/common';
import { DiscordNotificationEntity, NotificationLogEntity, UserEntity, UserSessionEntity, WebhookNotificationEntity } from '@libs/database';
import {
  IDiscordNotificationItemModel,
  IUserItemModel,
  IUserListItemModel,
  IUserNotificationLogModel,
  IUserSessionModel,
  IWebhookNotificationItemModel,
} from '../models';

@Injectable()
export class UsersMapper {
  entityToListItem(user: UserEntity): IUserListItemModel {
    const {
      id,
      displayName,
      balance,
      status,
      roles,
      twitchAccount,
      createdAt,
    } = user;
    return {
      id,
      displayName,
      balance,
      status,
      roles: roles.map((r) => r.name),
      allowPersonalSubscriptions: !!twitchAccount?.allowPersonalSubscriptions,
      createdAt,
    };
  }

  entityToItem(user: UserEntity): IUserItemModel {
    const {
      id,
      displayName,
      balance,
      status,
      roles,
      email,
      discordId,
      twitchAccount,
      createdAt,
    } = user;
    return {
      id,
      displayName,
      balance,
      status,
      email: email ?? null,
      discordId: discordId ?? null,
      roles: roles.map((r) => r.name),
      allowPersonalSubscriptions: !!twitchAccount?.allowPersonalSubscriptions,
      twitchLogin: twitchAccount?.twitchLogin ?? null,
      createdAt,
    };
  }

  sessionToModel(session: UserSessionEntity): IUserSessionModel {
    return {
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  discordNotificationToItem(n: DiscordNotificationEntity): IDiscordNotificationItemModel {
    return {
      id: n.id,
      status: n.status,
      costType: n.costType,
      cost: n.cost,
      channelId: n.channelId,
      discordGuildId: n.discordGuildId,
      streamerEventId: n.streamerEventId,
      createdAt: n.createdAt,
    };
  }

  webhookNotificationToItem(n: WebhookNotificationEntity): IWebhookNotificationItemModel {
    return {
      id: n.id,
      status: n.status,
      costType: n.costType,
      cost: n.cost,
      type: n.type,
      discordGuildId: n.discordGuildId ?? null,
      streamerEventId: n.streamerEventId,
      createdAt: n.createdAt,
    };
  }

  notificationLogToItem(log: NotificationLogEntity): IUserNotificationLogModel {
    return {
      id: log.id,
      notificationId: log.notificationId,
      notificationType: log.notificationType,
      status: log.status,
      streamerLogin: log.streamerLogin,
      eventType: log.eventType,
      errorMessage: log.errorMessage ?? null,
      createdAt: log.createdAt,
    };
  }
}
