import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetManagerPermissionDto {
  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'Discord permission bitfield flag value. Pass null to remove.' })
  @IsOptional()
  @IsString()
  permission?: string | null;
}
