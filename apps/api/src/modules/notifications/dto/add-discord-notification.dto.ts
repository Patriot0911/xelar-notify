import { NotificationPlatform, TwitchStreamerEvents } from '@libs/database';
import { IsEnum, IsJSON, IsOptional, IsString } from 'class-validator';

export class AddDiscordNotificationDto {
  @IsString()
  broadcasterId: string;

  @IsJSON()
  payload: string;

  @IsEnum([NotificationPlatform.DISCORD_BOT, NotificationPlatform.DISCORD_WEBHOOK])
  type: NotificationPlatform.DISCORD_BOT | NotificationPlatform.DISCORD_WEBHOOK;

  @IsEnum(TwitchStreamerEvents)
  event: TwitchStreamerEvents;

  @IsString()
  guildId: string;

  @IsString()
  @IsOptional()
  channelId?: string;

  @IsString()
  @IsOptional()
  webhookUrl?: string;
}
