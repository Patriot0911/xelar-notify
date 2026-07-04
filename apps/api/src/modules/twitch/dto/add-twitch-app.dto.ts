import { TwitchAppStatus } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  webhookSecret?: string;

  @ApiProperty({ enum: TwitchAppStatus, required: false })
  @IsEnum(TwitchAppStatus)
  @IsOptional()
  status?: TwitchAppStatus;
}
