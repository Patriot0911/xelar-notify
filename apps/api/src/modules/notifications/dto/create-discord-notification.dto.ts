import { NotificationCostType, TwitchStreamerEvents } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AllowedTwitchEvents } from '../models';

export class CreateDiscordNotificationDto {
  @IsString()
  broadcasterId: string;

  @IsEnum(AllowedTwitchEvents)
  event: TwitchStreamerEvents;

  @IsEnum(NotificationCostType)
  costType: NotificationCostType;

  @IsObject()
  payload: Record<string, unknown>;

  @IsString()
  guildId: string;

  @IsString()
  channelId: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gameFilters?: string[];
}
