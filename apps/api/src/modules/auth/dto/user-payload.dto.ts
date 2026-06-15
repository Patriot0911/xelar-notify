import { ApiProperty } from '@nestjs/swagger';
import type { IUserPayload } from '../models';
import { Permission } from '@libs/database';

export class UserPayloadDto implements IUserPayload {
  @ApiProperty({ type: 'string', })
  id: string;

  @ApiProperty({ type: 'string', example: 'Cillian Murphy', })
  displayName: string;

  @ApiProperty({ type: 'string', nullable: true, })
  discordId?: string | null;

  @ApiProperty({ type: 'string', nullable: true, })
  twitchLogin?: string | null;

  @ApiProperty({ type: 'boolean', })
  allowPersonalSubscriptions: boolean;

  @ApiProperty({ type: () => [Permission], isArray: true, })
  permissions: Permission[];

  @ApiProperty({ type: 'string', isArray: true, })
  roles: string[];
}
