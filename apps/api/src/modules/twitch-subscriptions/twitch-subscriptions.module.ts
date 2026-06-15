import { Module } from '@nestjs/common';
import { TwitchSubscriptionsCronService, TwitchSubscriptionService, TwitchUserTokenRefreshCronService } from './services';
import { TwitchModule } from '../twitch/twitch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DiscordNotificationEntity,
  TwitchStreamerEntity,
  TwitchStreamerEventEntity,
  UserEntity,
  WebhookNotificationEntity,
} from '@libs/database';
import { TwitchSubscriptionMapper } from './mappers';

@Module({
  imports: [
    TwitchModule,
    TypeOrmModule.forFeature([
      TwitchStreamerEventEntity,
      TwitchStreamerEntity,
      UserEntity,
      DiscordNotificationEntity,
      WebhookNotificationEntity,
    ]),
  ],
  providers: [
    TwitchSubscriptionsCronService,
    TwitchUserTokenRefreshCronService,
    TwitchSubscriptionService,
    TwitchSubscriptionMapper,
  ],
  exports: [
    TwitchSubscriptionService,
  ],
})
export class TwitchSubscriptionsModule {}
