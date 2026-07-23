import { NotificationLogStatus, NotificationLogType } from '@libs/database';

export interface IStreamerNotificationLogModel {
  id: string;
  notificationId: string;
  notificationType: NotificationLogType;
  status: NotificationLogStatus;
  eventType: string;
  errorMessage: string | null;
  createdAt: Date;
}
