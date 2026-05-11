import { Injectable } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { TwitchEventStatuses } from '@libs/database';

@Injectable()
export class StreamerEventsService {
  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
  ) {}

  markAsVerified(eventId: string) {
    this.twitchSubscriptionService.changeEventStatus(eventId, TwitchEventStatuses.VERIFIED);
  }

  markAsRevoked(eventId: string) {
    this.twitchSubscriptionService.changeEventStatus(eventId, TwitchEventStatuses.REVOKED);
  }
}
