import { AppConfigModule } from '@libs/config';
import { DatabaseModule, TwitchStreamerEventEntity } from '@libs/database';
import { Module } from '@nestjs/common';
import { StreamOnlineHandler } from './handlers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from '@libs/queue';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    QueueModule,
    TypeOrmModule.forFeature([
      TwitchStreamerEventEntity,
    ]),
  ],
  controllers: [
    StreamOnlineHandler,
  ],
  providers: [],
})
export class NotificationWorkerModule {}
