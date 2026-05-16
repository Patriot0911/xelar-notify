import { Module } from '@nestjs/common';
import { DiscordPayloadService } from './services';

@Module({
  imports: [],
  controllers: [],
  providers: [
    DiscordPayloadService,
  ],
  exports: [
    DiscordPayloadService,
  ],
})
export class NotificationPayloadModule {}
