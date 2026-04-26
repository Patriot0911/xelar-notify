import { Injectable } from '@nestjs/common';
import { IDiscordApiMeModel, IDiscordApiTokensModel, IDiscordMeModel, IDiscordTokensModel } from '../models';

@Injectable()
export class DiscordAuthMapper {
  ApiToMeModel(data: IDiscordApiMeModel): IDiscordMeModel {
    return {
      id: data.id,
      userName: data.username,
      avatar: data.avatar,
      email: data.email,
      verified: data.verified,
      globalName: data.global_name,
    };
  }

  ApiToTokensModel(data: IDiscordApiTokensModel): IDiscordTokensModel {
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scope: data.scope,
    };
  }
}
