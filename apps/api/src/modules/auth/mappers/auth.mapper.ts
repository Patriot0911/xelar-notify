import { UserEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';
import { IAuthResponse, ITokenModel, IUserPayload } from '../models';

@Injectable()
export class AuthMapper {
  async toAuthResponse(user: UserEntity, tokens: ITokenModel): Promise<IAuthResponse> {
    return {
      tokens,
      user: {
        id: user.id,
        displayName: user.displayName,
        discordId: user.discordId,
      },
    };
  }

  toMeDto(user: UserEntity): IUserPayload {
    return {
      id: user.id,
      displayName: user.displayName,
      discordId: user.discordId,
    };
  }
}
