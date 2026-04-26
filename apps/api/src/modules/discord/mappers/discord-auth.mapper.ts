import { Injectable } from '@nestjs/common';
import { IDiscordApiMeModel, IDiscordMeModel } from '../models';

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
}
