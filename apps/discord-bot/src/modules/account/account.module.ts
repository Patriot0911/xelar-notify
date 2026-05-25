import { Module } from '@nestjs/common';
import { AuthorizeCommand } from './commands';

@Module({
  providers: [AuthorizeCommand],
})
export class AccountModule {}
