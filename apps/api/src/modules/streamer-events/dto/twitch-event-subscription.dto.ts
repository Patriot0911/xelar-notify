import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TwitchAcknowledgeEventDto {
  @ApiProperty({ required: true })
  @IsString()
  eventId: string;
}
