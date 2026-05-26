import { AppConfig, AppConfigModule } from '@libs/config';
import { DatabaseModule, TwitchStreamerEventEntity } from '@libs/database';
import { Module } from '@nestjs/common';
import { StreamOnlineHandler } from './handlers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IQueueCredentials, QueueModule } from '@libs/queue';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    QueueModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>): IQueueCredentials => ({
        user: config.get('RABBIT_WORKER_USER')!,
        password: config.get('RABBIT_WORKER_PASSWORD')!,
      }),
    }),
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
