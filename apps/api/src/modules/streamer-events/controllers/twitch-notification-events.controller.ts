import { QueuePatterns } from '@libs/queue';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StreamerEventsService } from '../services';
import { TwitchAcknowledgeEventDto } from '../dto';

@Controller()
export class TwitchNotificationEventsController {
  constructor(
    private readonly streamerEventsService: StreamerEventsService,
  ) {}

  // todo
  @EventPattern(QueuePatterns.twitch.events)
  handleTwitchSubscriptionVerified(@Payload() data: TwitchAcknowledgeEventDto) {
  }
}
