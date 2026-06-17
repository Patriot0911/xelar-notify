import { NotificationLogStatus, NotificationLogType } from '@libs/database';

export interface INotificationLogModel {
  id: string;
  notificationId: string;
  notificationType: NotificationLogType;
  status: NotificationLogStatus;
  ownerId: string;
  discordGuildId: string | null;
  streamerLogin: string;
  eventType: string;
  requestPayload: Record<string, any> | null;
  errorMessage: string | null;
  createdAt: Date;
};
