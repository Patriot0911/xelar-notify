import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LinkDiscordDto {
  @ApiProperty({ type: 'string', description: 'Discord OAuth authorization code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
