import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetTwitchPersonalAuthDto {
  @ApiProperty({ type: 'boolean', description: 'Allow registering EventSub subscriptions using this user\'s Twitch token' })
  @IsBoolean()
  enabled: boolean;
}
