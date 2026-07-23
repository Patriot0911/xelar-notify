import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchTwitchCategoriesDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(1)
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cursor: string;
}
