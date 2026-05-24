import { TwitchAppEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';
import { ITwitchAppShortModel } from '../models';

@Injectable()
export class TwitchAppMapper {
  entityToListItem(twitchApp: TwitchAppEntity): ITwitchAppShortModel {
    return {
      id: twitchApp.id,
      name: twitchApp.name,
      clientId: twitchApp.clientId,
      createdAt: twitchApp.createdAt,
    };
  }
}
