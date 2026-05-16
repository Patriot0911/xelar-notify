import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotificationDestinationEntity, TwitchStreamerEntity, UserEntity } from '@libs/database';
import { DiscordModule } from '../discord/discord.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { NotificationsModule } from '../notifications/notifications.module';
import { AddDestinationHandler, AuthenticateHandler } from './handlers';
import { TwitchModule } from '../twitch';

@Module({
  imports: [
    DiscordModule,
    TwitchSubscriptionsModule,
    NotificationsModule,
    TwitchModule,
    TypeOrmModule.forFeature([
      UserEntity,
      DiscordNotificationDestinationEntity,
      TwitchStreamerEntity,
    ]),
  ],
  controllers: [AddDestinationHandler, AuthenticateHandler],
  providers: [],
})
export class DiscordHandlerModule {}
