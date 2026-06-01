import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetRawTwitchSubscriptionsDto {
  @ApiProperty({ required: true, description: 'Twitch App clientId' })
  @IsString()
  clientId: string;

  @ApiProperty({ required: false, description: 'Pagination cursor from previous response' })
  @IsOptional()
  @IsString()
  after?: string;
}
