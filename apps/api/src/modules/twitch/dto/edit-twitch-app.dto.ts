import { ApiProperty } from '@nestjs/swagger';
import { TwitchAppStatus } from '@libs/database';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class EditTwitchAppDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(8)
  clientSecret?: string;

  // todo: check if we can resub / change webhook secret / keep in db several secrets
  @ApiProperty({ description: 'Keep in mind that you cannot replace an existing webhook secret, if it already has any subscriptions' })
  @IsString()
  @IsOptional()
  webhookSecret?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: TwitchAppStatus, required: false })
  @IsEnum(TwitchAppStatus)
  @IsOptional()
  status?: TwitchAppStatus;
}
