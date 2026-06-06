import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotificationEntity, UserEntity } from '@libs/database';
import { DiscordModule } from '../discord/discord.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { NotificationsModule } from '../notifications/notifications.module';
import { AddDestinationHandler, AuthenticateHandler, ListDestinationsHandler, RemoveDestinationHandler } from './handlers';

@Module({
  imports: [
    DiscordModule,
    TwitchSubscriptionsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([UserEntity, DiscordNotificationEntity]),
  ],
  controllers: [
    AddDestinationHandler,
    RemoveDestinationHandler,
    ListDestinationsHandler,
    AuthenticateHandler,
  ],
  providers: [],
})
export class DiscordHandlerModule {}
