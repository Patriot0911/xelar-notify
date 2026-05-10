import { Module } from '@nestjs/common';
import { TwitchReceiverController } from './controllers';
import { TwitchDedupService, TwitchReceiverService, TwitchSecretCacheService, TwitchSecretService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchAppEntity } from '@libs/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitchAppEntity,
    ]),
  ],
  controllers: [TwitchReceiverController,],
  providers: [
    TwitchReceiverService,
    TwitchSecretService,
    TwitchSecretCacheService,
    TwitchDedupService,
  ],
  exports: [],
})
export class TwitchReceiverModule {}
