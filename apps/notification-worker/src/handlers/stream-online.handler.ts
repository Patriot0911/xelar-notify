import { TwitchStreamerEventEntity } from '@libs/database';
import type {
  IDiscordNotificationMessage,
  IStreamOnlineMessage,
} from '@libs/queue';
import {
  QueuePatterns,
  Queues,
  QueueService,
} from '@libs/queue';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildStreamOnlineVars, interpolatePayload } from '../interpolation';

@Controller()
export class StreamOnlineHandler {
  private readonly logger = new Logger(StreamOnlineHandler.name);

  constructor(
    @InjectRepository(TwitchStreamerEventEntity)
    private readonly eventsRepo: Repository<TwitchStreamerEventEntity>,
    private readonly queue: QueueService,
  ) {}

  @EventPattern(QueuePatterns.twitch.events.online)
  async handle(@Payload() data: IStreamOnlineMessage, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();

    try {
      const event = await this.eventsRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.streamer', 'streamer')
        .leftJoinAndSelect('event.discordNotifications', 'discord')
        .leftJoinAndSelect('event.webhookNotifications', 'webhook')
        .addSelect('webhook.webhookUrl')
        .where('event.subscriptionId = :subscriptionId', {
          subscriptionId: data.subscription.id,
        })
        .getOne();

      if (!event) return channel.ack(message);

      const vars = buildStreamOnlineVars(data.event, event.streamer?.profileImageUrl);

      await this.dispatchDiscord(event, vars);
      await this.dispatchWebhooks(event, vars);

      channel.ack(message);
    } catch (e) {
      this.logger.error('[StreamOnline]', e);
      channel.nack(message, false, true);
    }
  }

  private async dispatchDiscord(
    event: TwitchStreamerEventEntity,
    vars: Record<string, string>,
  ) {
    for (const dest of event.discordNotifications) {
      const payload: IDiscordNotificationMessage = {
        channelId:      dest.channelId,
        guildId:        dest.guildId,
        messagePayload: interpolatePayload(dest.messagePayload, vars),
      };

      await this.queue.emit(
        Queues.DISCORD_NOTIFICATIONS,
        QueuePatterns.discord.notifications.send,
        payload,
      );
    }
  }

  private async dispatchWebhooks(
    event: TwitchStreamerEventEntity,
    vars: Record<string, string>,
  ) {
    const active = event.webhookNotifications.filter((n) => n.webhookUrl);

    await Promise.allSettled(
      active.map((n) =>
        fetch(n.webhookUrl!, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(interpolatePayload(n.messagePayload, vars)),
        }).catch((err) =>
          this.logger.error(`[Webhook] ${n.id} failed`, err),
        ),
      ),
    );
  }
}
