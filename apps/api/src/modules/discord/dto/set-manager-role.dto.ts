import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetManagerRoleDto {
  @ApiPropertyOptional({ type: 'string', nullable: true, description: 'Discord role snowflake ID. Pass null to remove.' })
  @IsOptional()
  @IsString()
  roleId?: string | null;
}
