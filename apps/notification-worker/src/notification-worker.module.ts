import { AppConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { Module } from '@nestjs/common';
import { StreamOnlineHandler } from './handlers';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
  ],
  controllers: [
    StreamOnlineHandler,
  ],
  providers: [],
})
export class NotificationWorkerModule {}
