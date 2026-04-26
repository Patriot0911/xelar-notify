import { TokenType } from './token-type.enum';

export interface IAccessTokenPayload {
  use: TokenType.Access,
  sub: string;
};
