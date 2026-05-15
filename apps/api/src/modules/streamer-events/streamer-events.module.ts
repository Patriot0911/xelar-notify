import { Module } from '@nestjs/common';
import { StreamerEventsService } from './services';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { StreamerInternalEventsController, TwitchNotificationEventsController } from './controllers';

@Module({
  imports: [TwitchSubscriptionsModule,],
  controllers: [
    StreamerInternalEventsController,
    TwitchNotificationEventsController,
  ],
  providers: [StreamerEventsService],
  exports: [],
})
export class TwitchEventsModule {}
