import { IRemoveDestinationPayload } from '@libs/shared';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RemoveDestinationDto implements IRemoveDestinationPayload {
  @IsString()
  discordId: string;

  @IsUUID()
  notificationId: string;

  @IsString()
  @IsOptional()
  guildId?: string;
}
