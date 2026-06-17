import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity } from '@libs/database';
import { NotificationLogsService } from './services';
import { NotificationLogsController } from './controllers';
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
