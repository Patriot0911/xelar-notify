import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { IPaginationFilters } from '../models';

export const SEARCH_MAX_LENGTH = 100;

/**
 * Query params shared by list endpoints: `?page=&pageSize=&search=`.
 * Extend it per endpoint (and redeclare `pageSize` to change the default).
 */
export class SearchPaginationDto implements IPaginationFilters {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @ApiPropertyOptional({ description: 'Case-insensitive substring search', maxLength: SEARCH_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(SEARCH_MAX_LENGTH)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  search?: string;
}
