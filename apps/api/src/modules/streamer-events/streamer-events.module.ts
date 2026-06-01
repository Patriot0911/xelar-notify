import { Module } from '@nestjs/common';
import { StreamerEventsService } from './services';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { StreamerInternalEventsController } from './controllers';

@Module({
  imports: [TwitchSubscriptionsModule,],
  controllers: [
    StreamerInternalEventsController,
  ],
  providers: [StreamerEventsService],
  exports: [],
})
export class TwitchEventsModule {}
