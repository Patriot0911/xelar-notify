import { ApiProperty } from '@nestjs/swagger';
import type { IUserPayload } from '../models';

export class UserPayloadDto implements IUserPayload {
  @ApiProperty({ type: 'string', })
  id: string;

  @ApiProperty({ type: 'string', example: 'Cillian Murphy', })
  displayName: string;
}
