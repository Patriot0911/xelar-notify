import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IGetStreamersFiltersModel } from '../models';

export class GetStreamersRequestDto implements IGetStreamersFiltersModel {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: 'string', description: 'Search string' })
  search?: string;
};
