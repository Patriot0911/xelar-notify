import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordGuildEntity, DiscordNotificationEntity, NotificationLogEntity, UserEntity } from '@libs/database';
import { DiscordModule } from '../discord/discord.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { TwitchModule } from '../twitch/twitch.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AddDestinationHandler, AuthenticateHandler, GetProfileHandler, ListDestinationsHandler, RemoveDestinationHandler, SearchStreamersHandler, SuspendNotificationHandler } from './handlers';

@Module({
  imports: [
    DiscordModule,
    TwitchSubscriptionsModule,
    TwitchModule,
    NotificationsModule,
    TypeOrmModule.forFeature([UserEntity, DiscordNotificationEntity, NotificationLogEntity, DiscordGuildEntity]),
  ],
  controllers: [
    AddDestinationHandler,
    RemoveDestinationHandler,
    ListDestinationsHandler,
    AuthenticateHandler,
    SuspendNotificationHandler,
    SearchStreamersHandler,
    GetProfileHandler,
  ],
  providers: [],
})
export class DiscordHandlerModule {}
