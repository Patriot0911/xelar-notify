import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordNotificationEntity, TwitchStreamerEvents, WebhookNotificationEntity, } from '@libs/database';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordPayloadService } from '../../notification-payload/services';
import { DiscordWebhookiService } from '../../discord/services';
import { CreateDiscordNotificationDto, CreateWebhookNotificationDto } from '../dto';
import { NotificationsService } from './notifications.service';

@Injectable()
export class TwitchNotificationsService {
  readonly publicStreamerEvents: TwitchStreamerEvents[] = [
    TwitchStreamerEvents.STREAM_ONLINE,
  ];

  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
    private readonly discordPayloadService: DiscordPayloadService,
    private readonly discordWebhookService: DiscordWebhookiService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(DiscordNotificationEntity)
    private readonly discordNotificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(WebhookNotificationEntity)
    private readonly webhookNotificationRepository: Repository<WebhookNotificationEntity>,
  ) {}

  async createDiscordNotification(
    dto: CreateDiscordNotificationDto,
    ownerId: string,
  ): Promise<DiscordNotificationEntity> {
    await this.assertCanCreateEvent(ownerId, dto.broadcasterId, dto.event);

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(
      dto.broadcasterId,
      dto.event,
    );

    this.discordPayloadService.validatePayload(dto.payload);

    const cost = this.notificationsService.resolveCost(dto.costType);

    // todo: apply cost to user / guild / free
    // todo: add guild creation

    const notification = this.discordNotificationRepository.create({
      streamerEventId: subscription.id,
      guildId: dto.guildId,
      channelId: dto.channelId,
      messagePayload: dto.payload as any,
      onwerId: ownerId,
      costType: dto.costType,
      cost,
    });

    return this.discordNotificationRepository.save(notification);
  }

  async createWebhookNotification(
    dto: CreateWebhookNotificationDto,
    ownerId: string,
  ): Promise<WebhookNotificationEntity> {
    await this.assertCanCreateEvent(ownerId, dto.broadcasterId, dto.event);

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(
      dto.broadcasterId,
      dto.event,
    );

    const webhookType = this.notificationsService.detectWebhookType(dto.webhookUrl);
    this.notificationsService.validateWebhookPayload(webhookType, dto.payload);
    await this.discordWebhookService.validateWebhookUrl(dto.webhookUrl);

    const cost = this.notificationsService.resolveCost(dto.costType);

    // todo: apply cost to user / guild / free

    const notification = this.webhookNotificationRepository.create({
      streamerEventId: subscription.id,
      type: webhookType,
      webhookUrl: dto.webhookUrl,
      messagePayload: dto.payload as any,
      onwerId: ownerId,
      costType: dto.costType,
      cost,
    });

    return this.webhookNotificationRepository.save(notification);
  }

  async assertCanCreateEvent(
    userId: string,
    broadcasterId: string,
    event: TwitchStreamerEvents
  ) {
    // todo: add check for public events etc
  }
}
