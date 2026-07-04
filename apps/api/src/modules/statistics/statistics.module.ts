import { Module } from '@nestjs/common';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { TwitchModule } from '../twitch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordGuildEntity, DiscordNotificationEntity, NotificationLogEntity, TwitchStreamerEntity, UserEntity, WebhookNotificationEntity } from '@libs/database';
import { StatisticsService } from './services';
import { StatisticsController } from './controllers';

@Module({
  imports: [
    TwitchSubscriptionsModule,
    TwitchModule,
    TypeOrmModule.forFeature([
      TwitchStreamerEntity,
      DiscordNotificationEntity,
      WebhookNotificationEntity,
      NotificationLogEntity,
      DiscordGuildEntity,
      UserEntity,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
  ]
})
export class StatisticsModule {}
