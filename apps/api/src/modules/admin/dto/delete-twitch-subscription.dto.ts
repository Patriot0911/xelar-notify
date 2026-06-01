import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTwitchSubscriptionDto {
  @ApiProperty({ required: true, description: 'Twitch EventSub subscription id' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ required: true, description: 'Twitch App clientId that owns this subscription' })
  @IsString()
  clientId: string;
}
