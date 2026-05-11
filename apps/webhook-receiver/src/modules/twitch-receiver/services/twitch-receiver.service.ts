import { QueuePatterns, Queues, QueueService } from '@libs/queue';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchReceiverService {
  constructor(
    private readonly queueService: QueueService,
  ) {}

  acknowledgeEvent(eventId: string) {
    this.queueService.emit(
      Queues.TWITCH_SUBSCRIPTIONS,
      QueuePatterns.twitch.subscriptions.verified,
      { eventId, }
    );
  }

  revokeTwitchSubscription(eventId: string) {
    this.queueService.emit(
      Queues.TWITCH_SUBSCRIPTIONS,
      QueuePatterns.twitch.subscriptions.revoked,
      { eventId, }
    );
  }

  async handleEvent(dto: any) {
  }
}
