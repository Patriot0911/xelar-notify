import { DiscordPermissionFlag } from '../constants/manager-permission.constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetManagerPermissionDto {
  // todo: add enum check
  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'Discord permission bitfield flag value. Pass null to remove.' })
  @IsOptional()
  @IsString()
  permission?: DiscordPermissionFlag | null;
}
