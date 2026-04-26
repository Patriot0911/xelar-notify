import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DiscordAuthService } from './services';
import { DiscordAuthMapper } from './mappers';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://discord.com/api',
      timeout: 5000,
    }),
  ],
  providers: [
    DiscordAuthService,
    DiscordAuthMapper,
  ],
  exports: [DiscordAuthService,],
})
export class DiscordModule {}
