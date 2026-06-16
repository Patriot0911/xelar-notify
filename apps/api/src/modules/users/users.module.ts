import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DiscordNotificationEntity,
  NotificationLogEntity,
  RoleEntity,
  UserEntity,
  UserSessionEntity,
  WebhookNotificationEntity,
} from '@libs/database';
import { UsersController } from './controllers';
import { UsersService } from './services';
import { UsersMapper } from './mappers/users.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSessionEntity,
      RoleEntity,
      DiscordNotificationEntity,
      WebhookNotificationEntity,
      NotificationLogEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper],
})
export class UsersModule {}
