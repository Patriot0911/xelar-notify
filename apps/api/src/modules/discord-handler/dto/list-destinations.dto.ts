import { IListDestinationsPayload } from '@libs/shared';
import { IsOptional, IsString } from 'class-validator';

export class ListDestinationsDto implements IListDestinationsPayload {
  @IsString()
  discordId: string;

  @IsString()
  @IsOptional()
  guildId?: string;
}
