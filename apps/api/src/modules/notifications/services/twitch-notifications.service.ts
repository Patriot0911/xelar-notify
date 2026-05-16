import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordNotificationDestinationEntity, NotificationPlatform, TwitchStreamerEvents, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddDiscordNotificationDto } from '../dto';
import { DiscordWebhookiService } from '../../discord/services';
import { DiscordPayloadService } from '../../notification-payload/services';
import { NOTIFICATION_COST, NOTIFICATION_MAX_COST, NOTIFICATION_PARTNER_COST } from '../notifications.constants';

@Injectable()
export class TwitchNotificationsService {
  private readonly publicAllowedEvents = [
    TwitchStreamerEvents.STREAM_ONLINE,
  ];
  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
    private readonly discordPayloadService: DiscordPayloadService,
    private readonly discordApiService: DiscordWebhookiService,
    @InjectRepository(DiscordNotificationDestinationEntity)
    private discordNotificationDestinationsRepository: Repository<DiscordNotificationDestinationEntity>,
  ) {}

  async addDiscordNotification(dto: AddDiscordNotificationDto, ownerId: string): Promise<DiscordNotificationDestinationEntity> {
    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(dto.broadcasterId, dto.event);

    this.discordPayloadService.validatePayload(dto.payload);

    const notification = this.discordNotificationDestinationsRepository.create({
      streamerEventId: subscription.id,
      type: dto.type,
      guildId: dto.guildId,
      messagePayload: dto.payload,
      creditOwnerId: ownerId,
      creditCost: 1,
    });

    if (dto.type === NotificationPlatform.DISCORD_BOT) {
      notification.channelId = dto.channelId;
    } else {
      await this.discordApiService.validateWebhook(dto.webhookUrl!, dto.guildId);
      notification.webhookUrl = dto.webhookUrl;
    }

    const createdNotification = await this.discordNotificationDestinationsRepository.save(notification);
    return createdNotification;
  }

  async canAffordNotification(
    user: UserEntity,
    event: TwitchStreamerEvents,
    isStreamer: boolean,
    isPartnerStreamer = false,
  ): Promise<boolean> {
    const eventCost = NOTIFICATION_COST * (isPartnerStreamer ? NOTIFICATION_PARTNER_COST : 1);
    const isAllowedByCredits = user.creditsUsed + eventCost <= NOTIFICATION_MAX_COST;
    if (!this.publicAllowedEvents.includes(event)) {
      return isStreamer && isAllowedByCredits;
    }
    return isAllowedByCredits;
  }
}
