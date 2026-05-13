import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@libs/database';
import { TwitchNotificationsService } from './services';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';

@Module({
  imports: [
    TwitchSubscriptionsModule,
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  controllers: [],
  providers: [
    TwitchNotificationsService,
  ],
  exports: [
    TwitchNotificationsService,
  ],
})
export class NotificationsModule {}
