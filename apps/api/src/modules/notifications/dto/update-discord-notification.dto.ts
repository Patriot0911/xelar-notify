import { NotificationCostType } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateDiscordNotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationCostType)
  costType?: NotificationCostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  channelId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;
}
