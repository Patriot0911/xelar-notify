import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordNotificationDestinationEntity, NotificationPlatform, TwitchStreamerEvents, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddDiscordNotificationDto } from '../dto';
import { DiscordWebhookiService } from '../../discord';
import { DiscordPayloadService } from '../../notification-payload/services';

@Injectable()
export class TwitchNotificationsService {
  // todo: move these values to config or database
  private readonly publicEventsMaxCost = 20;
  private readonly privateEventsMaxCost = 10;
  private readonly publicAllowedEvents = [
    TwitchStreamerEvents.STREAM_ONLINE,
  ];

  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
    private readonly discordPayloadService: DiscordPayloadService,
    private readonly discordApiService: DiscordWebhookiService,
    @InjectRepository(DiscordNotificationDestinationEntity)
    private discordNotificationDestinationsRepository: Repository<DiscordNotificationDestinationEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async addDiscordNotification(dto: AddDiscordNotificationDto, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        twitchAccount: true,
        discordId: true,
        discordAccessToken: true,
        publicEvenetsCost: true,
        privateEvenetsCost: true,
      },
      relations: { twitchAccount: true, },
    });

    if (!user || !user.discordId || !user.discordAccessToken) {
      throw new UnauthorizedException('User cannot add Discord notifications without linking their Discord account');
    }

    const isOwnerOfStreamer = user.twitchAccount?.broadcasterId === dto.broadcasterId;

    if (!this.publicAllowedEvents.includes(dto.event) && !isOwnerOfStreamer) {
      throw new ForbiddenException('User is not the owner of the specified Twitch streamer, so they cannot add notifications for non-public events');
    }

    if (
      (
        this.publicAllowedEvents.includes(dto.event) &&
        user.publicEvenetsCost >= this.publicEventsMaxCost
      ) || (
        !this.publicAllowedEvents.includes(dto.event) &&
        user.privateEvenetsCost >= this.privateEventsMaxCost
      )
    ) {
      throw new ForbiddenException('User has exceeded the maximum cost for events');
    }

    const subscription = await this.twitchSubscriptionService.getOrCreateEvent(dto.broadcasterId, dto.event);

    this.discordPayloadService.validatePayload(dto.payload);

    const notification = this.discordNotificationDestinationsRepository.create({
      streamerEventId: subscription.id,
      type: dto.type,
      guildId: dto.guildId,
      messagePayload: dto.payload,
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
}
