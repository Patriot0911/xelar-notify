import { NotificationCostType } from '@libs/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateWebhookNotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationCostType)
  costType?: NotificationCostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gameFilters?: string[];
}
