import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@libs/database';
import { DiscordModule } from '../discord/discord.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { NotificationsModule } from '../notifications/notifications.module';
import { AddDestinationHandler, AuthenticateHandler } from './handlers';

@Module({
  imports: [
    DiscordModule,
    TwitchSubscriptionsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AddDestinationHandler, AuthenticateHandler],
  providers: [],
})
export class DiscordHandlerModule {}
