import { TwitchStreamerEvents } from '@libs/database';
import { IAddDestinationPayload } from '@libs/shared';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class AddDestinationDto implements IAddDestinationPayload {
  @IsString()
  discordId: string;

  @IsString()
  guildId: string;

  @IsString()
  channelId: string;

  @IsString()
  broadcasterId: string;

  @IsEnum(TwitchStreamerEvents)
  @IsOptional()
  eventType?: TwitchStreamerEvents;
}
