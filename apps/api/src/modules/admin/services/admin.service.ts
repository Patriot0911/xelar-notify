import { Injectable } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { AddStreamOnlineSubscriptionDto, DeleteTwitchSubscriptionDto, GetRawTwitchSubscriptionsDto, GetTwitchSubscriptionsDto } from '../dto';
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

  async deleteLocalTwitchEvent(id: string) {
    return this.twitchSubscriptionService.deleteLocalSubscription(id);
  }

  async getRawTwitchSubscriptions(query: GetRawTwitchSubscriptionsDto) {
    return this.twitchSubscriptionService.getRawTwitchSubscriptions(query.clientId, query.after);
  }

  async deleteTwitchOnlySubscription(dto: DeleteTwitchSubscriptionDto) {
    return this.twitchSubscriptionService.deleteTwitchOnlySubscription(dto.subscriptionId, dto.clientId);
  }
}
