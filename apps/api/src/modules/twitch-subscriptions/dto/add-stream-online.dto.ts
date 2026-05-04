import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddStreamOnlineDto {
  @ApiProperty({ required: true })
  @IsString()
  broadcasterId: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsOptional()
  appId?: string;
}
