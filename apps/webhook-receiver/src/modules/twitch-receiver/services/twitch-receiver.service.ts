import { QueuePatterns, QueueService } from '@libs/queue';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchReceiverService {
  constructor(
    private readonly queueService: QueueService,
  ) {}

  revokeTwitchSubscription() {
    this.queueService.emit(QueuePatterns.twitch.subscription.revoked, {});
  }

  acknowledgeEvent(eventId: string) {
    this.queueService.emit(QueuePatterns.twitch.subscription.verified, { eventId });
  }

  async handleEvent(dto: any) {
  }
}
