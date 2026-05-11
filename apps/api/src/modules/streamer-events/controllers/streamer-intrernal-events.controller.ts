import { QueuePatterns } from '@libs/queue';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StreamerEventsService } from '../services';
import { TwitchAcknowledgeEventDto } from '../dto';

@Controller()
export class StreamerInternalEventsController {
  constructor(
    private readonly streamerEventsService: StreamerEventsService,
  ) {}

  @EventPattern(QueuePatterns.twitch.subscriptions.verified)
  handleTwitchSubscriptionVerified(@Payload() data: TwitchAcknowledgeEventDto) {
    this.streamerEventsService.markAsVerified(data.eventId);
  }

  @EventPattern(QueuePatterns.twitch.subscriptions.revoked)
  handleTwitchSubscriptionRevoked(@Payload() data: TwitchAcknowledgeEventDto) {
    this.streamerEventsService.markAsRevoked(data.eventId);
  }
}
