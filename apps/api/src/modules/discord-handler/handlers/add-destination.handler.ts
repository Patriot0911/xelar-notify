import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { NotificationCostType, TwitchStreamerEntity, TwitchStreamerEvents, UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddDestinationDto } from '../dto';
import { IAddDestinationResult, RpcBusinessException, RpcError } from '@libs/shared';
import { RpcPayload } from '@libs/rpc';
import { NotificationsService } from '../../notifications/services';
import { DiscordAuthService } from '../../discord/services';

@Controller()
export class AddDestinationHandler {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private readonly twitchStreamerRepository: Repository<TwitchStreamerEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly discordAuthService: DiscordAuthService,
  ) {}

  @MessagePattern(RpcPatterns.discord.addDestination)
  async handle(@RpcPayload() data: AddDestinationDto): Promise<IAddDestinationResult> {
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

    const eventType = data.eventType ?? TwitchStreamerEvents.STREAM_ONLINE;

    const streamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId: data.broadcasterId },
    });

    const canAfford = true;
    // await this.twitchNotificationsService.canAffordNotification(
    //   user,
    //   eventType,
    //   streamer?.userId === user.id,
    //   streamer?.isPartner ?? false,
    // );

    if (!canAfford) {
      throw new RpcBusinessException(
        RpcError.INSUFFICIENT_CREDITS,
        'User cannot add this notification'
      );
    }

    const payload = {
      content: '${streamer_name} is now live!',
      embeds: [
        {
          title: '${streamer_name} is now live!',
          description: 'Watch the stream live!',
          color: 0x9146FF,
        },
      ],
    };

    const discordNotification = await this.notificationsService.createDiscordNotification(
      {
        broadcasterId: data.broadcasterId,
        channelId: data.channelId,
        guildId: data.guildId,
        event: eventType,
        payload,
        costType: NotificationCostType.Personal,
      },
      user.id,
    );

    return {
      channelId: discordNotification.channelId,
      eventType: discordNotification.streamerEvent?.event ?? eventType,
      cost: discordNotification.cost,
    };
  }
}
