import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@libs/database';
import { TwitchNotificationsService } from './services';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { DiscordModule } from '../discord';
import { NotificationPayloadModule } from '../notification-payload';

@Module({
  imports: [
    TwitchSubscriptionsModule,
    NotificationPayloadModule,
    DiscordModule,
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  controllers: [],
  providers: [
    TwitchNotificationsService,
  ],
  exports: [
    TwitchNotificationsService,
  ],
})
export class NotificationsModule {}
