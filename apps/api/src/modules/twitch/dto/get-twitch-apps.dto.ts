import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { IGetTwitchAppsFilterModel } from '../models';
import { Type } from 'class-transformer';

export class GetTwitchAppsDto implements IGetTwitchAppsFilterModel {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pageSize: number = 20;
}
