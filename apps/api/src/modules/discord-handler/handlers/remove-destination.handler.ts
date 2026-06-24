import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { DiscordNotificationEntity, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoveDestinationDto } from '../dto';
import { IRemoveDestinationResult, RpcBusinessException, RpcError } from '@libs/shared';
import { RpcPayload } from '@libs/rpc';
import { DiscordAuthService, DiscordGuildAccessService } from '../../discord/services';
import { TwitchNotificationsService } from '../../notifications/services/twitch-notifications.service';

@Controller()
export class RemoveDestinationHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DiscordNotificationEntity)
    private readonly notificationRepository: Repository<DiscordNotificationEntity>,
    private readonly discordAuthService: DiscordAuthService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
    private readonly twitchNotificationsService: TwitchNotificationsService,
  ) {}

  @MessagePattern(RpcPatterns.discord.removeDestination)
  async handle(@RpcPayload() data: RemoveDestinationDto): Promise<IRemoveDestinationResult> {
    const user = await this.usersRepository.findOne({
      where: { discordId: data.discordId },
    });

    if (!user) {
      throw new RpcBusinessException(
        RpcError.NOT_REGISTERED,
        'User is not registered in the system',
        { authUrl: this.discordAuthService.getDiscordAuthRedirectUri() },
      );
    }

    const notification = await this.notificationRepository.findOne({
      where: { id: data.notificationId },
      relations: ['guild'],
    });

    if (!notification) {
      throw new RpcBusinessException(RpcError.NOT_FOUND, 'Notification not found');
    }

    const isOwner = notification.onwerId === user.id;

    if (!isOwner) {
      if (!data.discordGuildId) {
        throw new RpcBusinessException(RpcError.FORBIDDEN, 'No permission to remove this notification');
      }

      const notifGuildId = notification.guild?.discordGuildId;
      if (notifGuildId !== data.discordGuildId) {
        throw new RpcBusinessException(RpcError.FORBIDDEN, 'Notification does not belong to this server');
      }

      const hasAccess = await this.discordGuildAccessService.canAccessGuild(user.id, data.discordGuildId);
      if (!hasAccess) {
        throw new RpcBusinessException(RpcError.FORBIDDEN, 'No permission to manage this server');
      }
    }

    const { streamerEventId } = notification;
    await this.notificationRepository.remove(notification);
    await this.twitchNotificationsService.cleanupSubscriptionIfUnused(streamerEventId);

    return { success: true };
  }
}
