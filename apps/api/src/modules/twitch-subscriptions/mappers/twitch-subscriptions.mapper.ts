import { TwitchStreamerEventEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchSubscriptionMapper {
  EntityToDto(twEvent: TwitchStreamerEventEntity) {
    return {
      ...twEvent,
    };
  }
}
