import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotificationEntity, UserEntity, WebhookNotificationEntity } from '@libs/database';
import { NotificationsService } from './services';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { DiscordModule } from '../discord';
import { NotificationPayloadModule } from '../notification-payload';
import { TwitchNotificationsService } from './services/twitch-notifications.service';

@Module({
  imports: [
    TwitchSubscriptionsModule,
    NotificationPayloadModule,
    DiscordModule,
    TypeOrmModule.forFeature([
      UserEntity,
      DiscordNotificationEntity,
      WebhookNotificationEntity,
    ]),
  ],
  controllers: [],
  providers: [
    NotificationsService,
    TwitchNotificationsService,
  ],
  exports: [
    NotificationsService,
    TwitchNotificationsService,
  ],
})
export class NotificationsModule {}
