import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotificationEntity, NotificationLogEntity, UserEntity } from '@libs/database';
import { DiscordModule } from '../discord/discord.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { NotificationsModule } from '../notifications/notifications.module';
import { AddDestinationHandler, AuthenticateHandler, ListDestinationsHandler, RemoveDestinationHandler, SuspendNotificationHandler } from './handlers';

@Module({
  imports: [
    DiscordModule,
    TwitchSubscriptionsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([UserEntity, DiscordNotificationEntity, NotificationLogEntity]),
  ],
  controllers: [
    AddDestinationHandler,
    RemoveDestinationHandler,
    ListDestinationsHandler,
    AuthenticateHandler,
    SuspendNotificationHandler,
  ],
  providers: [],
})
export class DiscordHandlerModule {}
