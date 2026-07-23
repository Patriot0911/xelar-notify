import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStreamerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
