import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchTwtichChannelsDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cursor: string;
}
