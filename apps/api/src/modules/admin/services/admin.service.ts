import { Injectable } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { AddStreamOnlineSubscriptionDto, GetTwitchSubscriptionsDto } from '../dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
  ) {}

  async addTwitchEventStreamOnline(dto: AddStreamOnlineSubscriptionDto) {
    return this.twitchSubscriptionService.registerStreamOnlineSubscription(dto.broadcasterId);
  }

  async getTwitchEvents(query: GetTwitchSubscriptionsDto) {
    return this.twitchSubscriptionService.getAllTwitchSubscriptions(query);
  }
}
