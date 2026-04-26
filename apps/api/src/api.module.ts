import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';
import { DiscordModule } from './modules/discord';
import { DatabaseModule } from '@libs/database';
import { AppConfigModule } from '@libs/config';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AppConfigModule,
    DiscordModule,
  ],
})
export class ApiModule {}
