import { NotificationCostType } from '@libs/database';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateWebhookNotificationDto {
  @IsOptional()
  @IsEnum(NotificationCostType)
  costType?: NotificationCostType;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
