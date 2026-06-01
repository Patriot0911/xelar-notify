import { Permission } from '@libs/database';
import { TokenType } from './token-type.enum';

export interface IAccessTokenPayload {
  use: TokenType.Access,
  sub: string;
  jti: string;
  sessionId: string;
  exp?: number;
  permissions: Permission[];
  roles: string[];
};
