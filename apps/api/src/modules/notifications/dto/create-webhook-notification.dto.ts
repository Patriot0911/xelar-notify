import { NotificationCostType, TwitchStreamerEvents } from '@libs/database';
import { IsEnum, IsObject, IsString } from 'class-validator';
import { AllowedTwitchEvents } from '../models';

export class CreateWebhookNotificationDto {
  @IsString()
  broadcasterId: string;

  @IsEnum(AllowedTwitchEvents)
  event: TwitchStreamerEvents;

  @IsEnum(NotificationCostType)
  costType: NotificationCostType;

  @IsObject()
  payload: Record<string, unknown>;

  @IsString()
  webhookUrl: string;
}
