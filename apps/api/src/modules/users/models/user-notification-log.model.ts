import { NotificationLogStatus, NotificationLogType } from '@libs/database';

export interface IUserNotificationLogModel {
  id: string;
  notificationId: string;
  notificationType: NotificationLogType;
  status: NotificationLogStatus;
  streamerLogin: string;
  eventType: string;
  errorMessage: string | null;
  createdAt: Date;
}
