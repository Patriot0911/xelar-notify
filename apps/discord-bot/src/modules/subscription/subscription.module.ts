import { Module } from '@nestjs/common';
import { PingCommand } from './commands/ping.command';

@Module({
  providers: [PingCommand],
})
export class SubscriptionModule {}
