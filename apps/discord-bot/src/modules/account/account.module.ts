import { Module } from '@nestjs/common';
import { AuthorizeCommand, ProfileCommand } from './commands';

@Module({
  providers: [AuthorizeCommand, ProfileCommand],
})
export class AccountModule {}
