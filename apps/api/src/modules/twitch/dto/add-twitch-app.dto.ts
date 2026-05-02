import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddTwitchAppDto {
  @ApiProperty({ required: true })
  @IsString()
  clientId: string;

  @ApiProperty({ required: true })
  @IsString()
  clientSecret: string;

  @ApiProperty({ required: true })
  @IsString()
  name: string;
}
