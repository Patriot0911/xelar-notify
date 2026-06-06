import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { DiscordNotificationEntity, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListDestinationsDto } from '../dto';
import { IDestinationItem, IListDestinationsResult, RpcBusinessException, RpcError } from '@libs/shared';
import { RpcPayload } from '@libs/rpc';
import { DiscordAuthService, DiscordGuildAccessService } from '../../discord/services';

@Controller()
export class ListDestinationsHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DiscordNotificationEntity)
    private readonly notificationRepository: Repository<DiscordNotificationEntity>,
    private readonly discordAuthService: DiscordAuthService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
  ) {}

  @MessagePattern(RpcPatterns.discord.listDestinations)
  async handle(@RpcPayload() data: ListDestinationsDto): Promise<IListDestinationsResult> {
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

    if (data.guildId) {
      const hasAccess = await this.discordGuildAccessService.canAccessGuild(user.id, data.guildId);

      if (!hasAccess) {
        throw new RpcBusinessException(RpcError.FORBIDDEN, 'No permission to view this server\'s notifications');
      }

      return { items: await this.fetchGuildDestinations(data.guildId, user.id) };
    }

    return { items: await this.fetchOwnDestinations(user.id) };
  }

  private async fetchGuildDestinations(guildId: string, requesterId: string): Promise<IDestinationItem[]> {
    const notifications = await this.notificationRepository
      .createQueryBuilder('n')
      .innerJoinAndSelect('n.discordGuild', 'guild', 'guild.guildId = :guildId', { guildId })
      .leftJoinAndSelect('n.streamerEvent', 'event')
      .leftJoinAndSelect('event.streamer', 'streamer')
      .getMany();

    return notifications.map(n => this.toItem(n, requesterId));
  }

  private async fetchOwnDestinations(ownerId: string): Promise<IDestinationItem[]> {
    const notifications = await this.notificationRepository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.streamerEvent', 'event')
      .leftJoinAndSelect('event.streamer', 'streamer')
      .where('n.onwerId = :ownerId', { ownerId })
      .getMany();

    return notifications.map(n => this.toItem(n, ownerId));
  }

  private toItem(n: DiscordNotificationEntity, requesterId: string): IDestinationItem {
    return {
      id: n.id,
      streamerLogin: n.streamerEvent?.streamer?.twitchLogin ?? '—',
      streamerDisplayName: n.streamerEvent?.streamer?.displayName ?? '—',
      eventType: n.streamerEvent?.event ?? '—',
      channelId: n.channelId,
      costType: n.costType,
      isOwn: n.onwerId === requesterId,
    };
  }
}
