import { AppConfigModule } from '@libs/config';
import { DatabaseModule, TwitchStreamerEventEntity } from '@libs/database';
import { Module } from '@nestjs/common';
import { StreamOnlineHandler } from './handlers';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
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
