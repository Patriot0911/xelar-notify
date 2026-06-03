import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity } from '@libs/database';
import { NotificationLogsService } from './notification-logs.service';
import { NotificationLogsController } from './notification-logs.controller';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLogEntity]),
    DiscordModule,
  ],
  controllers: [NotificationLogsController],
  providers: [NotificationLogsService],
})
export class NotificationLogsModule {}
