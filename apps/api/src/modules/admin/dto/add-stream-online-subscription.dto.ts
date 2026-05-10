import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddStreamOnlineSubscriptionDto {
  @ApiProperty({ required: true })
  @IsString()
  broadcasterId: string;
}
