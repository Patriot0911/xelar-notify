import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordNotificationEntity, NotificationCostType, NotificationStatus, TwitchStreamerEvents, UserEntity, WebhookNotificationEntity, WebhookType, } from '@libs/database';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordPayloadService } from '../../notification-payload/services';
import { DiscordGuildAccessService, DiscordGuildService, DiscordWebhookService } from '../../discord/services';
import { CreateDiscordNotificationDto, CreateWebhookNotificationDto, UpdateDiscordNotificationDto, UpdateWebhookNotificationDto } from '../dto';
import { NotificationsService } from './notifications.service';

@Injectable()
export class TwitchNotificationsService {
  readonly publicStreamerEvents: TwitchStreamerEvents[] = [
    TwitchStreamerEvents.STREAM_ONLINE,
  ];

  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
    private readonly discordPayloadService: DiscordPayloadService,
    private readonly discordWebhookService: DiscordWebhookService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
    private readonly notificationsService: NotificationsService,
    private readonly discordGuildService: DiscordGuildService,
    @InjectRepository(DiscordNotificationEntity)
    private readonly discordNotificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(WebhookNotificationEntity)
    private readonly webhookNotificationRepository: Repository<WebhookNotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createDiscordNotification(
    dto: CreateDiscordNotificationDto,
    ownerId: string,
  ): Promise<DiscordNotificationEntity> {
    await this.assertCanCreate(ownerId, dto.broadcasterId, dto.event);
    await this.assertCanAfford(ownerId, dto.broadcasterId, dto.costType, dto.guildId);

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(
      dto.broadcasterId,
      dto.event,
    );

    this.discordPayloadService.validateBotPayload(dto.payload);

    const cost = this.notificationsService.resolveCost(dto.costType);
    await this.applyCharge(ownerId, cost, dto.costType, dto.guildId);

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
    await this.assertCanAfford(ownerId, dto.broadcasterId, dto.costType, guildId);

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
      await this.discordWebhookService.validateDiscordWebhook(dto.webhookUrl, guildId);
      // todo: check if user associated with guild
      const guild = await this.discordGuildService.getOrCreateGuild(guildId);
      notification.guildId = guild.id;
    }

    await this.applyCharge(ownerId, cost, dto.costType, guildId);

    return this.webhookNotificationRepository.save(notification);
  }

  async getGuildNotifications(discordGuildId: string) {
    const [bot, webhook] = await Promise.all([
      this.discordNotificationRepository
        .createQueryBuilder('n')
        .innerJoinAndSelect('n.guild', 'guild', 'guild.discordGuildId = :discordGuildId', { discordGuildId })
        .leftJoinAndSelect('n.streamerEvent', 'event')
        .leftJoinAndSelect('event.streamer', 'streamer')
        .getMany(),
      this.webhookNotificationRepository
        .createQueryBuilder('n')
        .innerJoinAndSelect('n.guild', 'guild', 'guild.discordGuildId = :discordGuildId', { discordGuildId })
        .leftJoinAndSelect('n.streamerEvent', 'event')
        .leftJoinAndSelect('event.streamer', 'streamer')
        .getMany(),
    ]);
    return { bot, webhook };
  }

  async getUserNotifications(ownerId: string) {
    const [bot, webhook] = await Promise.all([
      this.discordNotificationRepository.find({
        where: { onwerId: ownerId },
        relations: ['streamerEvent', 'streamerEvent.streamer', 'guild'],
      }),
      this.webhookNotificationRepository.find({
        where: { onwerId: ownerId },
        relations: ['streamerEvent', 'streamerEvent.streamer'],
      }),
    ]);
    return { bot, webhook };
  }

  async updateDiscordNotification(
    id: string,
    dto: UpdateDiscordNotificationDto,
    ownerId: string,
  ): Promise<DiscordNotificationEntity> {
    const notification = await this.discordNotificationRepository.findOne({
      where: { id, },
      relations: ['guild'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.onwerId !== ownerId) {
      await this.discordGuildAccessService.assertAccessAdmin(ownerId, notification.guild.discordGuildId);
    }

    if (dto.payload !== undefined) {
      this.discordPayloadService.validateBotPayload(dto.payload);
      notification.messagePayload = dto.payload as any;
    }

    if (dto.costType !== undefined) notification.costType  = dto.costType;
    if (dto.channelId !== undefined) notification.channelId = dto.channelId;
    if (dto.isDisabled !== undefined) notification.isDisabled = dto.isDisabled;

    notification.status = NotificationStatus.Active;

    return this.discordNotificationRepository.save(notification);
  }

  async updateWebhookNotification(
    id: string,
    dto: UpdateWebhookNotificationDto,
    ownerId: string,
  ): Promise<WebhookNotificationEntity> {
    const notification = await this.webhookNotificationRepository.findOne({
      where: { id, },
      select: ['id', 'onwerId', 'guildId', 'webhookUrl', 'messagePayload', 'costType'],
      relations: ['guild'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.onwerId !== ownerId) {
      if (!notification.guildId) {
        throw new ForbiddenException('You have no access to this notification');
      }
      await this.discordGuildAccessService.assertAccessAdmin(ownerId, notification.guild!.discordGuildId);
    }

    if (dto.payload !== undefined) {
      const resolvedUrl = dto.webhookUrl ?? notification.webhookUrl ?? '';
      const webhookType = this.notificationsService.detectWebhookType(resolvedUrl);
      if (webhookType === WebhookType.DISCORD) {
        this.discordPayloadService.validateWebhookPayload(dto.payload);
      }
      notification.messagePayload = dto.payload as any;
    }

    if (dto.costType  !== undefined) notification.costType = dto.costType;
    if (dto.costType  !== undefined) notification.costType = dto.costType;
    if (dto.isDisabled !== undefined) notification.isDisabled = dto.isDisabled;
    if (
      dto.webhookUrl !== undefined
      && notification.guildId
      && notification.webhookUrl !== dto.webhookUrl
    ) {
      await this.discordWebhookService.validateDiscordWebhook(dto.webhookUrl, notification.guild!.discordGuildId);
      notification.webhookUrl = dto.webhookUrl;
    }

    notification.status = NotificationStatus.Active;

    return this.webhookNotificationRepository.save(notification);
  }

  async deleteDiscordNotification(id: string, ownerId: string): Promise<void> {
    const notification = await this.discordNotificationRepository.findOne({
      where: { id, },
      relations: ['guild'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.onwerId !== ownerId) {
      await this.discordGuildAccessService.assertAccessAdmin(ownerId, notification.guild.discordGuildId);
    }

    const { streamerEventId } = notification;
    await this.discordNotificationRepository.remove(notification);
    await this.cleanupSubscriptionIfUnused(streamerEventId);
  }

  async deleteWebhookNotification(id: string, ownerId: string): Promise<void> {
    const notification = await this.webhookNotificationRepository.findOne({
      where: { id, },
      relations: ['guild'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.onwerId !== ownerId) {
      if (!notification.guildId) {
        throw new ForbiddenException('You have no access to this notification');
      }
      await this.discordGuildAccessService.assertAccessAdmin(ownerId, notification.guild!.discordGuildId);
    }

    const { streamerEventId } = notification;
    await this.webhookNotificationRepository.remove(notification);
    await this.cleanupSubscriptionIfUnused(streamerEventId);
  }


  async cleanupSubscriptionIfUnused(streamerEventId: string): Promise<void> {
    const [discordCount, webhookCount] = await Promise.all([
      this.discordNotificationRepository.count({ where: { streamerEventId } }),
      this.webhookNotificationRepository.count({ where: { streamerEventId } }),
    ]);

    if (discordCount === 0 && webhookCount === 0) {
      await this.twitchSubscriptionService.deleteLocalSubscription(streamerEventId);
    }
  }

  async assertCanCreate(
    userId: string,
    broadcasterId: string,
    event: TwitchStreamerEvents
  ): Promise<void> {
    if (!this.publicStreamerEvents.includes(event)) {
      const allowed = await this.twitchSubscriptionService.allowsPersonalSubscriptions(broadcasterId);
      if (!allowed) {
        throw new BadRequestException('This event is only available for streamers who authorized personal subscriptions');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: { twitchAccount: { broadcasterId: true } },
        relations: ['twitchAccount']
      });

      if (!user || user.twitchAccount?.broadcasterId !== broadcasterId) {
        throw new BadRequestException('You can only create notifications for your own streams');
      }
    }
  }

  async assertCanAfford(
    userId: string,
    broadcasterId: string,
    costType: NotificationCostType,
    discordGuildId?: string,
  ): Promise<void> {
    if (costType === NotificationCostType.Credit) {
      const allowed = await this.twitchSubscriptionService.allowsPersonalSubscriptions(broadcasterId);
      if (!allowed) {
        throw new BadRequestException('This streamer has not enabled free notifications');
      }
      return;
    }

    const cost = this.notificationsService.resolveCost(costType);
    if (cost <= 0) return;

    if (costType === NotificationCostType.Personal) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: { balance: true },
      });
      if (!user || Number(user.balance) < cost) {
        throw new BadRequestException('Insufficient balance');
      }
    }

    if (costType === NotificationCostType.Guild) {
      if (!discordGuildId) {
        throw new BadRequestException('Guild ID required for guild-funded notifications');
      }
      await this.discordGuildService.assertGuildBalance(discordGuildId, cost);
    }
  }

  private async applyCharge(
    userId: string,
    cost: number,
    costType: NotificationCostType,
    guildId?: string,
  ): Promise<void> {
    if (cost <= 0) return;

    if (costType === NotificationCostType.Personal) {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ balance: () => 'balance - :amount' })
        .where('id = :id AND balance >= :amount')
        .setParameters({ id: userId, amount: cost })
        .execute();

      if (result.affected === 0) {
        throw new BadRequestException('Insufficient balance');
      }
    }

    if (costType === NotificationCostType.Guild && guildId) {
      await this.discordGuildService.deductGuildBalance(guildId, cost);
    }
  }
}
