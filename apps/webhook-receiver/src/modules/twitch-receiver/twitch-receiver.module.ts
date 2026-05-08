import { Module } from '@nestjs/common';
import { TwitchReceiverController } from './controllers';
import { TwitchReceiverService, TwitchSecretCacheService, TwitchSecretService } from './services';

@Module({
  imports: [],
  controllers: [TwitchReceiverController,],
  providers: [
    TwitchReceiverService,
    TwitchSecretService,
    TwitchSecretCacheService,
  ],
  exports: [],
})
export class TwitchReceiverModule {}
