import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { DiscordGuildEntity, DiscordNotificationEntity, NotificationStatus, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProfileDto } from '../dto';
import { IGetProfileResult, RpcBusinessException, RpcError } from '@libs/shared';
import { RpcPayload } from '@libs/rpc';
import { DiscordAuthService } from '../../discord/services';

@Controller()
export class GetProfileHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(DiscordNotificationEntity)
    private readonly notificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(DiscordGuildEntity)
    private readonly discordGuildRepository: Repository<DiscordGuildEntity>,
    private readonly discordAuthService: DiscordAuthService,
  ) {}

  @MessagePattern(RpcPatterns.discord.getProfile)
  async handle(@RpcPayload() data: GetProfileDto): Promise<IGetProfileResult> {
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

    const subscriptionsCount = await this.notificationRepository.count({
      where: { onwerId: user.id, status: NotificationStatus.Active },
    });

    const result: IGetProfileResult = {
      balance: user.balance,
      subscriptionsCount,
    };

    if (data.guildId) {
      const guild = await this.discordGuildRepository.findOne({
        where: { guildId: data.guildId },
      });

      const guildSubscriptionsCount = await this.notificationRepository
        .createQueryBuilder('n')
        .innerJoin('n.discordGuild', 'guild', 'guild.guildId = :guildId', { guildId: data.guildId })
        .where('n.status = :status', { status: NotificationStatus.Active })
        .getCount();



      result.guild = {
        balance: guild?.balance ?? 0,
        subscriptionsCount: guildSubscriptionsCount,
      };
    }

    return result;
  }
}
