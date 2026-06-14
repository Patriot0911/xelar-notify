import { Module } from '@nestjs/common';
import { DiscordModule } from '../discord/discord.module';
import { AddDestinationAutocompleteHandler, AddDestinationButtonHandler, AddDestinationCommand, AddDestinationModalHandler } from './commands';
import { SendNotificationHandler } from './handlers';
import { PendingDestinationStore } from './services';

@Module({
  imports: [DiscordModule],
  providers: [
    AddDestinationCommand,
    AddDestinationModalHandler,
    AddDestinationButtonHandler,
    AddDestinationAutocompleteHandler,
    PendingDestinationStore,
  ],
  controllers: [SendNotificationHandler],
})
export class NotificationsModule {}
