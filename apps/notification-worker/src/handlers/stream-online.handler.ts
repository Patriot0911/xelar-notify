import { TwitchStreamerEventEntity } from '@libs/database';
import { QueuePatterns, Queues, QueueService } from '@libs/queue';
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller()
export class StreamOnlineHandler {
  constructor(
    @InjectRepository(TwitchStreamerEventEntity)
    private readonly eventsRepo: Repository<TwitchStreamerEventEntity>,
    private readonly queue: QueueService,
  ) {}

  @EventPattern(QueuePatterns.twitch.events.stream.online)
  async handle(@Payload() data: any, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();

    try {
      const event = await this.eventsRepo.findOne({
        where: { subscriptionId: data.subscription.id },
        relations: ['discordDestinations'],
      });

      if (!event) return channel.ack(message);

      for (const dest of event.discordNotifications) {
        await this.queue.emit(
          Queues.DISCORD_NOTIFICATIONS,
          QueuePatterns.discord.notifications.send,
          {
            channelId:      dest.channelId,
            guildId:        dest.guildId,
            messagePayload: dest.messagePayload,
            streamer:       data.event,
          },
        );
      }

      channel.ack(message);
    } catch (e) {
      console.error('[StreamOnline]', e);
      channel.nack(message, false, true);
    }
  }
}
