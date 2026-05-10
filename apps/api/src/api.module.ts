import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';
import { DiscordModule } from './modules/discord';
import { TwitchModule } from './modules/twitch';
import { DatabaseModule } from '@libs/database';
import { AppConfig, AppConfigModule } from '@libs/config';
import { TwitchSubscriptionsModule } from './modules/twitch-subscriptions';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CryptoModule } from '@libs/shared';
import { QueueCredentials, QueueModule } from '@libs/queue';
import { ConfigService } from '@nestjs/config';
import { AdminModule } from './modules/admin';

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
    QueueModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>): QueueCredentials => ({
        user:     config.get('RABBIT_API_USER')!,
        password: config.get('RABBIT_API_PASSWORD')!,
      }),
    })
  ],
})
export class ApiModule {}
