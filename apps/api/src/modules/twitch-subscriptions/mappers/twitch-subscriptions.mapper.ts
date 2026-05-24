import { TwitchStreamerEventEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchSubscriptionMapper {
  entityToDto(twEvent: TwitchStreamerEventEntity) {
    return {
      ...twEvent,
    };
  }
}
