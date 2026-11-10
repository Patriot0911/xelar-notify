import { Injectable } from '@nestjs/common';
import { NotificationLogEntity, UserEntity, UserSessionEntity } from '@libs/database';
import {
  IUserItemModel,
  IUserListItemModel,
  IUserNotificationLogModel,
  IUserSessionModel,
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
