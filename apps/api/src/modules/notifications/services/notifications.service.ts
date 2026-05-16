import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';
import { DiscordNotificationDestinationEntity, NotificationPlatform, TwitchStreamerEvents, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddDiscordNotificationDto } from '../dto';
import { DiscordWebhookiService } from '../../discord/services';
import { DiscordPayloadService } from '../../notification-payload/services';

@Injectable()
export class NotificationsService {

  // constructor(
  //   private readonly twitchSubscriptionService: TwitchSubscriptionService,
  //   private readonly discordPayloadService: DiscordPayloadService,
  //   private readonly discordApiService: DiscordWebhookiService,
  //   @InjectRepository(DiscordNotificationDestinationEntity)
  //   private discordNotificationDestinationsRepository: Repository<DiscordNotificationDestinationEntity>,
  //   @InjectRepository(UserEntity)
  //   private usersRepository: Repository<UserEntity>,
  // ) {}

  // async addDiscordNotification(dto: AddDiscordNotificationDto, userId: string) {
  //   const user = await this.usersRepository.findOne({
  //     where: { id: userId },
  //     select: {
  //       twitchAccount: true,
  //       discordId: true,
  //       discordAccessToken: true,
  //       publicCreditsUsed: true,
  //       privateCreditsUsed: true,
  //     },
  //     relations: { twitchAccount: true, },
  //   });

  //   if (!user || !user.discordId) {
  //     throw new UnauthorizedException('User cannot add Discord notifications without linking their Discord account');
  //   }

  //   const isOwnerOfStreamer = user.twitchAccount?.broadcasterId === dto.broadcasterId;

  //   if (!this.canAffordNotification(user, dto.event, isOwnerOfStreamer)) {
  //     throw new ForbiddenException('User is not the owner of the specified Twitch streamer, so they cannot add notifications for non-public events');
  //   }

  //   if (
  //     (
  //       this.publicAllowedEvents.includes(dto.event) &&
  //       user.publicCreditsUsed >= this.publicEventsMaxCost
  //     ) || (
  //       !this.publicAllowedEvents.includes(dto.event) &&
  //       user.privateCreditsUsed >= this.privateEventsMaxCost
  //     )
  //   ) {
  //     throw new ForbiddenException('User has exceeded the maximum cost for events');
  //   }
  // }
}
