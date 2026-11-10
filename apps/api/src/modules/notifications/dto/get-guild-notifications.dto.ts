import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetGuildNotificationsDto {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize: number = 10;
}
