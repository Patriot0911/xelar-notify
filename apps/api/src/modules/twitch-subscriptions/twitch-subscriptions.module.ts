import { Module } from '@nestjs/common';
import { TwitchSubscriptionsCronService, TwitchSubscriptionService } from './services';
import { TwitchModule } from '../twitch/twitch.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchStreamerEntity, TwitchStreamerEventEntity } from '@libs/database';
import { TwitchSubscriptionMapper } from './mappers';

@Module({
  imports: [
    TwitchModule,
    TypeOrmModule.forFeature([
      TwitchStreamerEventEntity,
      TwitchStreamerEntity,
    ]),
  ],
  providers: [
    TwitchSubscriptionsCronService,
    TwitchSubscriptionService,
    TwitchSubscriptionMapper,
  ],
  exports: [
    TwitchSubscriptionService,
  ],
})
export class TwitchSubscriptionsModule {}
