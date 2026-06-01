import { IStreamOnlineMessage, QueuePatterns, Queues, QueueService } from '@libs/queue';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TwitchReceiverService {
  private readonly logger = new Logger(TwitchReceiverService.name);

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
    const subscriptionType: string = dto?.subscription?.type;

    if (!subscriptionType) {
      this.logger.warn('Received event without subscription type');
      return;
    }

    if (subscriptionType === 'stream.online') {
      const payload: IStreamOnlineMessage = {
        subscription: { id: dto.subscription.id },
        event: dto.event,
      };
      this.queueService.emit(
        Queues.STREAM_EVENTS,
        QueuePatterns.twitch.events.online,
        payload,
      );
      return;
    }

    this.logger.warn(`Unhandled Twitch event type: ${subscriptionType}`);
  }
}
