import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@libs/database';
import { TwitchNotificationsService } from './services';
import { TwitchNotificationsController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  controllers: [
    TwitchNotificationsController,
  ],
  providers: [
    TwitchNotificationsService,
  ],
  exports: [],
})
export class NotificationsModule {}
