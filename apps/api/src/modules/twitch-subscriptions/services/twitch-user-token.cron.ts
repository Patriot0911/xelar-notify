import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchStreamerEntity, UserEntity } from '@libs/database';
import { LessThan, Not, IsNull, Repository } from 'typeorm';
import { TwitchUserTokenService } from '../../twitch/services';
import { TwitchTokenRevokedException } from '../../auth/exceptions';
import { TwitchSubscriptionService } from './twitch-subscriptions.service';

const TWITCH_TOKEN_REFRESH_CRON = '*/15 * * * *'; // Every 15 minutes
const TOKEN_REFRESH_WINDOW_MS = 60 * 60 * 1000; // refresh tokens expiring within the next hour

@Injectable()
export class TwitchUserTokenRefreshCronService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private twitchStreamersRepository: Repository<TwitchStreamerEntity>,
    private twitchUserTokenService: TwitchUserTokenService,
    private twitchSubscriptionService: TwitchSubscriptionService,
  ) {}

  @Cron(TWITCH_TOKEN_REFRESH_CRON)
  async refreshExpiringTokens() {
    const refreshBefore = new Date(Date.now() + TOKEN_REFRESH_WINDOW_MS);

    const users = await this.usersRepository.find({
      where: {
        twitchRefreshToken: Not(IsNull()),
        twitchTokenExpiresAt: LessThan(refreshBefore),
      },
      select: {
        id: true,
        twitchRefreshToken: true,
      },
    });

    for (const user of users) {
      try {
        await this.twitchUserTokenService.refresh(user.id, user.twitchRefreshToken!);
      } catch (e) {
        if (e instanceof TwitchTokenRevokedException) {
          const streamer = await this.twitchStreamersRepository.findOne({
            where: { userId: user.id },
          });
          if (streamer) {
            await this.twitchSubscriptionService.downgradeUserAuthorizedSubscriptions(streamer.id);
          }
        }
      }
    }
  }
}
