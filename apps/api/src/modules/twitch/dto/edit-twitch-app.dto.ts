import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class EditTwitchAppDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(8)
  clientSecret?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
}
