import { NotificationCostType, TwitchStreamerEvents } from '@libs/database';
import { IsEnum, IsObject, IsString } from 'class-validator';

export class CreateDiscordNotificationDto {
  @IsString()
  broadcasterId: string;

  @IsEnum(TwitchStreamerEvents)
  event: TwitchStreamerEvents;

  @IsEnum(NotificationCostType)
  costType: NotificationCostType;

  @IsObject()
  payload: Record<string, unknown>;

  @IsString()
  discordGuildId: string;

  @IsString()
  channelId: string;
}
