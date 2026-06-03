import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotificationEntity, NotificationLogEntity } from '@libs/database';
import { NotificationLogsService } from './notification-logs.service';
import { NotificationLogsController } from './notification-logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationLogEntity,
      DiscordNotificationEntity,
    ]),
  ],
  controllers: [NotificationLogsController],
  providers: [NotificationLogsService],
})
export class NotificationLogsModule {}
