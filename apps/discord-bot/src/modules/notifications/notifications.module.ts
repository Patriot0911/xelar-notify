import { Module } from '@nestjs/common';
import { AddDestinationCommand } from './commands';

@Module({
  providers: [AddDestinationCommand],
})
export class NotificationsModule {}
