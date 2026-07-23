import { NotificationCostType, TwitchStreamerEvents } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gameFilters?: string[];
}
