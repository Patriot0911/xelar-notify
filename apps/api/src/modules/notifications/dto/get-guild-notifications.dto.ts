import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { SearchPaginationDto } from 'apps/api/src/shared';

/** `?page=&pageSize=&search=` for notification lists; search matches streamer name/login and event type. */
export class GetGuildNotificationsDto extends SearchPaginationDto {
  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;
}
