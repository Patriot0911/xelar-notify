import { AppConfigModule } from '@libs/config';
import { DiscordModule, SubscriptionModule } from './modules';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AppConfigModule,
    DiscordModule,
    SubscriptionModule,
  ],
  controllers: [],
  providers: [],
})
export class DiscordBotModule {}
