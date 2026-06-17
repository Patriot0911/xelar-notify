import { IGetProfilePayload } from '@libs/shared';
import { IsOptional, IsString } from 'class-validator';

export class GetProfileDto implements IGetProfilePayload {
  @IsString()
  discordId: string;

  @IsString()
  @IsOptional()
  discordGuildId?: string;
}
