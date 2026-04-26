import { ApiProperty } from '@nestjs/swagger';
import type { IAuthResponse, ITokenModel, IUserPayload } from '../models';
import { TokenDto } from './tokens.dto';
import { UserPayloadDto } from './user-payload.dto';

export class AuthResponseDto implements IAuthResponse {
  @ApiProperty({ type: TokenDto, })
  tokens: ITokenModel;

  @ApiProperty({ type: UserPayloadDto, })
  user: IUserPayload;
}
