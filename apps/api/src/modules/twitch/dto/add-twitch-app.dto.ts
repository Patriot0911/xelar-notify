import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddTwitchAppDto {
  @ApiProperty({ required: true })
  @IsString()
  clientId: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  clientSecret: string;

  @ApiProperty({ required: true })
  @IsString()
  name: string;
}
