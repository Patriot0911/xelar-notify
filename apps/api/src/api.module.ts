import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';
import { DiscordModule } from './modules/discord';
import { TwitchModule } from './modules/twitch';
import { DatabaseModule } from '@libs/database';
import { AppConfigModule } from '@libs/config';
import { CryptoModule } from './modules/crypto';
import { TwitchSubscriptionsModule } from './modules/twitch-subscriptions';
import { NotificationsModule } from './modules/notifications/notifications.module';

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
  ],
})
export class ApiModule {}
