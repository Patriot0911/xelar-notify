import { ApiProperty } from '@nestjs/swagger';
import type { ISessionModel } from '../models';

export class SessionDto implements ISessionModel {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  expiresAt: Date;
}
