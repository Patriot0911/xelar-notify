import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordNotificationEntity, NotificationCostType, TwitchStreamerEvents, WebhookNotificationEntity, WebhookType, } from '@libs/database';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordPayloadService } from '../../notification-payload/services';
import { DiscordGuildService, DiscordWebhookiService } from '../../discord/services';
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
    private readonly discordGuildService: DiscordGuildService,
    @InjectRepository(DiscordNotificationEntity)
    private readonly discordNotificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(WebhookNotificationEntity)
    private readonly webhookNotificationRepository: Repository<WebhookNotificationEntity>,
  ) {}

  async createDiscordNotification(
    dto: CreateDiscordNotificationDto,
    ownerId: string,
  ): Promise<DiscordNotificationEntity> {
    await this.assertCanCreate(ownerId, dto.broadcasterId, dto.event);
    await this.assertCanAfford(ownerId, dto.broadcasterId, dto.costType);

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(
      dto.broadcasterId,
      dto.event,
    );

    this.discordPayloadService.validateBotPayload(dto.payload);

    const cost = this.notificationsService.resolveCost(dto.costType);

    // todo: apply cost to user / guild / free

    const guild = await this.discordGuildService.getOrCreateGuild(dto.guildId);

    const notification = this.discordNotificationRepository.create({
      streamerEventId: subscription.id,
      guildId: guild.id,
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
    guildId?: string
  ): Promise<WebhookNotificationEntity> {
    await this.assertCanCreate(ownerId, dto.broadcasterId, dto.event);
    await this.assertCanAfford(ownerId, dto.broadcasterId, dto.costType);

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(
      dto.broadcasterId,
      dto.event,
    );

    const webhookType = this.notificationsService.detectWebhookType(dto.webhookUrl);
    if (webhookType === WebhookType.DISCORD) {
      this.discordPayloadService.validateWebhookPayload(dto.payload);
    }

    const cost = this.notificationsService.resolveCost(dto.costType);

    const notification = this.webhookNotificationRepository.create({
      streamerEventId: subscription.id,
      type: webhookType,
      webhookUrl: dto.webhookUrl,
      messagePayload: dto.payload as any,
      onwerId: ownerId,
      costType: dto.costType,
      cost,
    });

    if (guildId) {
      await this.discordWebhookService.validateWebhookUrl(dto.webhookUrl);
      // todo: check if user associated with guild
      const guild = await this.discordGuildService.getOrCreateGuild(guildId);
      notification.discordGuildId = guild.id;
    }

    // todo: apply cost to user / guild / free

    return this.webhookNotificationRepository.save(notification);
  }

  async assertCanCreate(
    userId: string,
    broadcasterId: string,
    event: TwitchStreamerEvents
  ) {
    // todo: add check for public events etc
  }

  async assertCanAfford(
    userId: string,
    broadcasterId: string,
    costType: NotificationCostType
  ) {
  }
}
