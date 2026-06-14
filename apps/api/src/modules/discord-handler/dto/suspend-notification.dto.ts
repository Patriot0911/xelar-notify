import { ISuspendNotificationPayload } from '@libs/shared';
import { IsString, IsUUID } from 'class-validator';

export class SuspendNotificationDto implements ISuspendNotificationPayload {
  @IsUUID()
  notificationId: string;

  @IsString()
  reason: string;
}
