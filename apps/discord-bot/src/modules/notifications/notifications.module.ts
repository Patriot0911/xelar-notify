import { Module } from '@nestjs/common';
import { DiscordModule } from '../discord/discord.module';
import { AddDestinationCommand } from './commands';
import { SendNotificationHandler } from './handlers';

@Module({
  imports: [DiscordModule],
  providers: [AddDestinationCommand],
  controllers: [SendNotificationHandler],
})
export class NotificationsModule {}
