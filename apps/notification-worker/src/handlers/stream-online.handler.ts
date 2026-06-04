import { NotificationLogEntity, NotificationLogStatus, NotificationLogType, TwitchStreamerEventEntity } from '@libs/database';
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
    @InjectRepository(NotificationLogEntity)
    private readonly logsRepo: Repository<NotificationLogEntity>,
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
      const interpolated = interpolatePayload(dest.messagePayload, vars);
      const payload: IDiscordNotificationMessage = {
        channelId:      dest.channelId,
        guildId:        dest.guildId,
        messagePayload: interpolated,
      };

      let status = NotificationLogStatus.Sent;
      let errorMessage: string | null = null;

      try {
        await this.queue.emit(
          Queues.DISCORD_NOTIFICATIONS,
          QueuePatterns.discord.notifications.send,
          payload,
        );
      } catch (err) {
        status = NotificationLogStatus.Failed;
        errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`[Discord] ${dest.id} emit failed`, err);
      }

      await this.logsRepo.save({
        notificationId:   dest.id,
        notificationType: NotificationLogType.Discord,
        status,
        ownerId:          dest.onwerId,
        guildId:          dest.guildId ?? null,
        streamerLogin:    event.streamer?.twitchLogin ?? '',
        eventType:        event.event,
        requestPayload:   interpolated as Record<string, any> | null,
        errorMessage,
      });
    }
  }

  private async dispatchWebhooks(
    event: TwitchStreamerEventEntity,
    vars: Record<string, string>,
  ) {
    const active = event.webhookNotifications.filter((n) => n.webhookUrl);

    const results = await Promise.allSettled(
      active.map((n) =>
        fetch(n.webhookUrl!, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(interpolatePayload(n.messagePayload, vars)),
        }),
      ),
    );

    const logs = active.map((n, i) => {
      const result = results[i];
      const interpolated = interpolatePayload(n.messagePayload, vars);
      const failed = result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok);

      if (failed) {
        const reason = result.status === 'rejected'
          ? String(result.reason)
          : `HTTP ${result.value.status}`;
        this.logger.error(`[Webhook] ${n.id} failed: ${reason}`);
      }

      return this.logsRepo.create({
        notificationId:   n.id,
        notificationType: NotificationLogType.Webhook,
        status:           failed ? NotificationLogStatus.Failed : NotificationLogStatus.Sent,
        ownerId:          n.onwerId,
        guildId:          n.discordGuildId ?? null,
        streamerLogin:    event.streamer?.twitchLogin ?? '',
        eventType:        event.event,
        requestPayload:   interpolated as Record<string, any> | null,
        errorMessage:     failed
          ? (result.status === 'rejected' ? String(result.reason) : `HTTP ${result.value.status}`)
          : null,
      });
    });

    if (logs.length) {
      await this.logsRepo.save(logs);
    }
  }
}
