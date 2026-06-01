import { NotificationCostType } from '@libs/database';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateDiscordNotificationDto {
  @IsOptional()
  @IsEnum(NotificationCostType)
  costType?: NotificationCostType;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
