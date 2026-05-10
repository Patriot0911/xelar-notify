import { Module } from '@nestjs/common';
import { TwitchReceiverModule } from './modules/twitch-receiver';
import { AppConfig, AppConfigModule } from '@libs/config';
import { RedisModule } from '@libs/redis';
import { DatabaseModule } from '@libs/database';
import { CryptoModule } from '@libs/shared';
import { QueueCredentials, QueueModule } from '@libs/queue';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TwitchReceiverModule,
    AppConfigModule,
    RedisModule,
    DatabaseModule,
    CryptoModule,
    RedisModule,
    QueueModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>): QueueCredentials => ({
        user:     config.get('RABBIT_RECEIVER_USER')!,
        password: config.get('RABBIT_RECEIVER_PASSWORD')!,
      }),
    })
  ],
})
export class WebhookReceiverModule {}
