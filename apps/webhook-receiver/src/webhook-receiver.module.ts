import { Module } from '@nestjs/common';
import { TwitchReceiverModule } from './modules/twitch-receiver';
import { AppConfigModule } from '@libs/config';
import { RedisModule } from '@libs/redis';
import { DatabaseModule } from '@libs/database';
import { CryptoModule } from '@libs/shared';

@Module({
  imports: [
    TwitchReceiverModule,
    AppConfigModule,
    RedisModule,
    DatabaseModule,
    CryptoModule,
  ],
})
export class WebhookReceiverModule {}
