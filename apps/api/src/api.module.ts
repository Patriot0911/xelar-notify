import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';
import { DiscordModule } from './modules/discord';
import { TwitchModule } from './modules/twitch';
import { DatabaseModule } from '@libs/database';
import { AppConfigModule } from '@libs/config';
import { TwitchSubscriptionsModule } from './modules/twitch-subscriptions';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TwitchEventsModule } from './modules/streamer-events';
import { CryptoModule } from '@libs/shared';
import { AdminModule } from './modules/admin';
import { NotificationPayloadModule } from './modules/notification-payload';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AppConfigModule,
    DiscordModule,
    TwitchModule,
    TwitchSubscriptionsModule,
    NotificationsModule,
    CryptoModule,
    AdminModule,
    TwitchEventsModule,
    NotificationPayloadModule,
  ],
})
export class ApiModule {}
