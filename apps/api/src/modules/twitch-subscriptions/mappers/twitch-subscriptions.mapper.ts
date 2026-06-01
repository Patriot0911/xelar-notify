import { TwitchStreamerEventEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchSubscriptionMapper {
  entityToDto(twEvent: TwitchStreamerEventEntity) {
    return {
      id: twEvent.id,
      subscriptionId: twEvent.subscriptionId,
      event: twEvent.event,
      eventStatus: twEvent.eventStatus,
      appCost: twEvent.appCost,
      createdAt: twEvent.createdAt,
      twitchApp: twEvent.twitchApp
        ? {
            id: twEvent.twitchApp.id,
            name: twEvent.twitchApp.name,
            clientId: twEvent.twitchApp.clientId,
            status: twEvent.twitchApp.status,
          }
        : null,
      streamer: twEvent.streamer
        ? {
            id: twEvent.streamer.id,
            broadcasterId: twEvent.streamer.broadcasterId,
            twitchLogin: twEvent.streamer.twitchLogin,
            displayName: twEvent.streamer.displayName,
            profileImageUrl: twEvent.streamer.profileImageUrl,
          }
        : null,
    };
  }
}
