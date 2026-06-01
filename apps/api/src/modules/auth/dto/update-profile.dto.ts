import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import type { IUpdateProfileModel } from '../models';

export class UpdateProfileDto implements IUpdateProfileModel {
  @ApiPropertyOptional({ type: 'string', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @ApiPropertyOptional({ type: 'string', minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  oldPassword?: string;
}
