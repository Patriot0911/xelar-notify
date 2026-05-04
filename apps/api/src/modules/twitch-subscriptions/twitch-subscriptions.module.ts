import { Module } from '@nestjs/common';
import { TwitchSubscriptionService } from './services';
import { TwitchModule } from '../twitch/twitch.module';
import { TwitchSubscriptionsController } from './controllers';

@Module({
  imports: [
    TwitchModule,
  ],
  controllers: [TwitchSubscriptionsController,],
  providers: [
    TwitchSubscriptionService,
  ],
  exports: [
    TwitchSubscriptionService,
  ],
})
export class TwitchSubscriptionsModule {}
