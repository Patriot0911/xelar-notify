import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth';
import { DiscordModule } from './modules/discord';
import { TwitchModule } from './modules/twitch';
import { DatabaseModule } from '@libs/database';
import { AppConfigModule } from '@libs/config';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AppConfigModule,
    DiscordModule,
    TwitchModule,
  ],
})
export class ApiModule {}
