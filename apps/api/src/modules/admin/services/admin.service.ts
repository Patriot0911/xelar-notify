import { Injectable } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { AddStreamOnlineSubscriptionDto, GetTwitchSubscriptionsDto } from '../dto';
import { TwitchStreamerEvents } from '@libs/database';

@Injectable()
export class AdminService {
  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
  ) {}

  async addTwitchEventStreamOnline(dto: AddStreamOnlineSubscriptionDto) {
    return this.twitchSubscriptionService.registerSubscription(dto.broadcasterId, TwitchStreamerEvents.STREAM_ONLINE);
  }

  async getTwitchEvents(query: GetTwitchSubscriptionsDto) {
    return this.twitchSubscriptionService.getAllTwitchSubscriptions(query);
  }
}
